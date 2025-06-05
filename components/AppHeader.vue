<template>
    <header
        class="fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800"
    >
        <div class="flex items-center justify-between px-4 h-14">
            <!-- Left section -->
            <div class="flex items-center gap-4">
                <NuxtLink to="/" class="flex items-center gap-2">
                    <UIcon name="i-heroicons-beaker" class="w-6 h-6 text-primary" />
                    <span class="text-xl font-semibold">VLM Predictions</span>
                </NuxtLink>
            </div>

            <!-- Center section - Search -->
            <div class="flex-1 max-w-2xl mx-4 hidden sm:block">
                <div ref="searchContainer" class="relative">
                    <div class="flex">
                        <UInput
                            v-model="searchQuery"
                            placeholder="Search transcripts..."
                            class="flex-1"
                            :ui="{
                                rounded: 'rounded-l-full',
                                color: {
                                    gray: {
                                        outline:
                                            'bg-gray-900 border-gray-700 focus:border-blue-500',
                                    },
                                },
                            }"
                            @update:model-value="handleSearch"
                        />
                        <UButton
                            icon="i-heroicons-magnifying-glass"
                            color="gray"
                            variant="solid"
                            class="rounded-r-full rounded-l-none border-l-0"
                            :ui="{
                                base: 'bg-gray-800 hover:bg-gray-700 border-gray-700',
                            }"
                        />
                    </div>
                    
                    <!-- Search Results Dropdown -->
                    <div
                        v-if="searchResults && searchResults.length > 0 && searchQuery"
                        class="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
                    >
                        <div
                            v-for="(result, idx) in searchResults"
                            :key="idx"
                            @click="selectSearchResult(result)"
                            class="p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700 last:border-b-0"
                        >
                            <div class="flex items-start justify-between">
                                <div class="flex-1">
                                    <div class="flex items-center gap-2 mb-1">
                                        <p class="text-sm font-medium text-white">
                                            {{ result.videoTitle }}
                                        </p>
                                        <UBadge
                                            :label="result.type"
                                            :color="result.type === 'audio' ? 'blue' : 'green'"
                                            variant="subtle"
                                            size="xs"
                                        />
                                    </div>
                                    <p class="text-xs text-gray-400 line-clamp-2">
                                        ...<span v-html="highlightText(result.content, searchQuery)"></span>...
                                    </p>
                                </div>
                                <UBadge
                                    :label="formatTimestamp(result.timestamp)"
                                    color="primary"
                                    variant="soft"
                                    size="xs"
                                    class="ml-2 flex-shrink-0"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div
                        v-else-if="searchQuery && !isSearching"
                        class="absolute top-full mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-4 text-center text-gray-500"
                    >
                        No results found for "{{ searchQuery }}"
                    </div>
                </div>
            </div>

            <!-- Right section -->
            <div class="flex items-center gap-2">
                <UButton
                    icon="i-heroicons-magnifying-glass"
                    color="gray"
                    variant="ghost"
                    class="sm:hidden"
                />
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
import { debounce } from 'lodash-es'

interface SearchResult {
    videoIndex: number
    videoTitle: string
    segmentIndex: number
    timestamp: number
    content: string
    type: 'audio' | 'video'
}

const searchQuery = ref<string>('')
const searchResults = ref<SearchResult[]>([])
const isSearching = ref<boolean>(false)

const props = defineProps<{
    predictions?: any[]
}>()

const emit = defineEmits<{
    'select-result': [result: SearchResult]
}>()

const handleSearch = debounce(() => {
    if (!searchQuery.value || searchQuery.value.length < 2) {
        searchResults.value = []
        return
    }
    
    isSearching.value = true
    const query = searchQuery.value.toLowerCase()
    const results: SearchResult[] = []
    
    if (!props.predictions || !Array.isArray(props.predictions)) {
        isSearching.value = false
        return
    }
    
    props.predictions.forEach((prediction: any, videoIndex: number) => {
        const videoTitle = prediction.title || `VLM Prediction ${videoIndex + 1}`
        
        prediction.response?.segments?.forEach((segment: any, segmentIndex: number) => {
            // Search in audio content
            if (segment.audio?.content?.toLowerCase().includes(query)) {
                results.push({
                    videoIndex,
                    videoTitle,
                    segmentIndex,
                    timestamp: segment.start_time || 0,
                    content: segment.audio.content,
                    type: 'audio'
                })
            }
            
            // Search in video content
            if (segment.video?.content?.toLowerCase().includes(query)) {
                results.push({
                    videoIndex,
                    videoTitle,
                    segmentIndex,
                    timestamp: segment.start_time || 0,
                    content: segment.video.content,
                    type: 'video'
                })
            }
        })
    })
    
    searchResults.value = results.slice(0, 10) // Limit to 10 results
    isSearching.value = false
}, 300)

function selectSearchResult(result: SearchResult) {
    emit('select-result', result)
    searchQuery.value = ''
    searchResults.value = []
}

function highlightMatch(text: string, query: string): string {
    const index = text.toLowerCase().indexOf(query.toLowerCase())
    if (index === -1) return text
    
    const start = Math.max(0, index - 30)
    const end = Math.min(text.length, index + query.length + 30)
    const excerpt = text.substring(start, end)
    
    // Return plain text - we'll use v-html to render the highlight
    return excerpt
}

function formatTimestamp(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

function highlightText(text: string, query: string): string {
    const excerpt = highlightMatch(text, query)
    return excerpt.replace(
        new RegExp(`(${query})`, 'gi'),
        '<mark class="bg-yellow-500 text-black px-0.5 rounded">$1</mark>'
    )
}

// Close dropdown when clicking outside or pressing escape
const searchContainer = ref<HTMLElement>()

onMounted(() => {
    // Click outside handler
    const handleClickOutside = (e: MouseEvent) => {
        if (!searchContainer.value?.contains(e.target as Node)) {
            searchResults.value = []
        }
    }
    
    // Escape key handler
    const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            searchResults.value = []
            searchQuery.value = ''
        }
    }
    
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    
    onUnmounted(() => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
    })
})
</script>
