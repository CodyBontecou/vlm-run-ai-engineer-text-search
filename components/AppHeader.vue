<template>
    <header
        class="fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800"
    >
        <div class="flex items-center justify-between px-4 h-14">
            <!-- Left section -->
            <div class="flex items-center gap-4">
                <NuxtLink to="/" class="flex items-center gap-2">
                    <svg width="38" height="38" viewBox="0 0 27 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.61916 2.48095C1.61916 1.11076 2.72991 0 4.1001 0H7.33842V1.65397H4.1001C3.64337 1.65397 3.27312 2.02422 3.27312 2.48095V8.97498C3.27312 9.43171 2.90287 9.80196 2.44614 9.80196L2.44614 10.198C2.90287 10.198 3.27312 10.5683 3.27312 11.025V17.5191C3.27312 17.9758 3.64337 18.346 4.1001 18.346H7.33842V20H4.1001C2.72991 20 1.61916 18.8892 1.61916 17.5191V10.827H0V9.17302H1.61916V2.48095Z" fill="currentColor"></path>
                        <path d="M6.84154 9.37968L5.00564 4.27884H6.50413L7.73468 7.95065L8.94539 4.27884H10.4141L8.57821 9.37968H6.84154Z" fill="currentColor"></path>
                        <path d="M10.682 9.37968V2.43302H12.0812V9.37968H10.682Z" fill="currentColor"></path>
                        <path d="M18.961 4.2193C20.0129 4.2193 20.8465 4.81473 20.8465 6.45216V9.37968H19.4472V6.53155C19.4472 5.76741 19.1694 5.37046 18.564 5.37046C17.9587 5.37046 17.5518 5.81703 17.5518 6.59109V9.37968H16.1525V6.53155C16.1525 5.76741 15.8747 5.37046 15.2594 5.37046C14.6541 5.37046 14.2571 5.83688 14.2571 6.60101V9.37968H12.8578V4.27884H14.0785L14.2075 4.91397C14.5151 4.51702 14.9617 4.22923 15.706 4.2193C16.3312 4.20938 16.9167 4.43763 17.2342 5.08267C17.5915 4.53686 18.1869 4.2193 18.961 4.2193Z" fill="currentColor"></path>
                        <path d="M8.99974 11.3082H9.23791V12.5784H8.68217C7.84857 12.5784 7.53101 13.1342 7.53101 13.9082V16.409H6.13176V11.3082H7.402L7.53101 12.0723C7.80888 11.6158 8.20583 11.3082 8.99974 11.3082Z" fill="currentColor"></path>
                        <path d="M13.0683 13.8586V11.3082H14.4675V16.409H13.227L13.098 15.7938C12.7705 16.1907 12.324 16.4686 11.5995 16.4686C10.5476 16.4686 9.57508 15.9426 9.57508 14.1365V11.3082H10.9743V13.9479C10.9743 14.8609 11.2721 15.3075 11.9667 15.3075C12.6614 15.3075 13.0683 14.8014 13.0683 13.8586Z" fill="currentColor"></path>
                        <path d="M18.1694 11.2487C19.2709 11.2487 20.2137 11.8342 20.2137 13.5808V16.409H18.8144V13.7197C18.8144 12.8563 18.487 12.3998 17.7824 12.3998C17.0579 12.3998 16.6411 12.9159 16.6411 13.7991V16.409H15.2419V11.3082H16.4625L16.5915 11.9433C16.919 11.5464 17.3854 11.2487 18.1694 11.2487Z" fill="currentColor"></path>
                        <path d="M24.6354 2.48095C24.6354 1.11076 23.5247 0 22.1545 0H18.9162V1.65397H22.1545C22.6112 1.65397 22.9815 2.02422 22.9815 2.48095V8.97498C22.9815 9.43171 23.3517 9.80196 23.8085 9.80196V10.198C23.3517 10.198 22.9815 10.5683 22.9815 11.025V17.5191C22.9815 17.9758 22.6112 18.346 22.1545 18.346H18.9162V20H22.1545C23.5247 20 24.6354 18.8892 24.6354 17.5191V10.827H26.2546V9.17302H24.6354V2.48095Z" fill="currentColor"></path>
                    </svg>
                    <span class="text-xl font-semibold">VLM Run</span>
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
                            @update:model-value="handleSearch"
                        />
                    </div>

                    <!-- Search Results Dropdown -->
                    <div
                        v-if="
                            searchResults &&
                            searchResults.length > 0 &&
                            searchQuery
                        "
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
                                        <p
                                            class="text-sm font-medium text-white"
                                        >
                                            {{ result.videoTitle }}
                                        </p>
                                        <UBadge
                                            :label="result.type"
                                            :color="
                                                result.type === 'audio'
                                                    ? 'blue'
                                                    : 'green'
                                            "
                                            variant="subtle"
                                            size="xs"
                                        />
                                    </div>
                                    <p
                                        class="text-xs text-gray-400 line-clamp-2"
                                    >
                                        ...<span
                                            v-html="
                                                highlightText(
                                                    result.content,
                                                    searchQuery
                                                )
                                            "
                                        ></span
                                        >...
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
    searchQuery?: string
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
        const videoTitle =
            prediction.title || `VLM Prediction ${videoIndex + 1}`

        prediction.response?.segments?.forEach(
            (segment: any, segmentIndex: number) => {
                // Search in audio content
                if (segment.audio?.content?.toLowerCase().includes(query)) {
                    results.push({
                        videoIndex,
                        videoTitle,
                        segmentIndex,
                        timestamp: segment.start_time || 0,
                        content: segment.audio.content,
                        type: 'audio',
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
                        type: 'video',
                    })
                }
            }
        )
    })

    searchResults.value = results.slice(0, 10) // Limit to 10 results
    isSearching.value = false
}, 300)

function selectSearchResult(result: SearchResult) {
    emit('select-result', { ...result, searchQuery: searchQuery.value })
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
