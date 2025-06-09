<template>
    <div
        class="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-5rem)] lg:grid-rows-none grid-rows-[60%_40%]"
    >
        <!-- Left column - Video player and list -->
        <div class="flex flex-col h-full overflow-hidden">
            <!-- Video player -->
            <div
                v-if="selectedVideo !== null && predictions?.[selectedVideo]"
                class="mb-4 flex-shrink-0"
            >
                <div class="aspect-video bg-black rounded-lg shadow-lg">
                    <iframe
                        ref="youtubePlayer"
                        :src="
                            getYouTubeEmbedUrl(predictions[selectedVideo].url)
                        "
                        class="w-full h-full rounded-lg"
                        frameborder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowfullscreen
                        loading="lazy"
                    ></iframe>
                </div>
            </div>
            
            <!-- Video player skeleton -->
            <div
                v-else-if="pending"
                class="mb-4 flex-shrink-0"
            >
                <div class="aspect-video bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer rounded-lg shadow-lg flex items-center justify-center">
                    <div class="text-gray-500">
                        <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z"/>
                        </svg>
                    </div>
                </div>
            </div>

            <!-- Video list -->
            <div class="flex-1 overflow-y-auto min-h-0">
                <h2
                    class="text-lg font-semibold mb-4 sticky top-0 bg-gray-950 z-10"
                >
                    Videos
                </h2>

                <div v-if="pending" class="space-y-2">
                    <div
                        v-for="i in 5"
                        :key="i"
                        class="flex gap-3 p-3 bg-gray-900 rounded-lg"
                    >
                        <div class="w-32 h-20 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer rounded"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer rounded" :style="{ width: `${60 + (i * 5)}%` }"></div>
                            <div class="h-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer rounded" :style="{ width: `${30 + (i * 3)}%` }"></div>
                            <div class="h-3 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer rounded w-1/4"></div>
                        </div>
                    </div>
                </div>

                <div v-else-if="error" class="text-red-500">
                    <p>Error: {{ error.message }}</p>
                </div>

                <div v-else class="space-y-2">
                    <div
                        v-for="(prediction, index) in predictions"
                        :key="index"
                        @click="selectedVideo = index"
                        :class="[
                            'flex gap-3 p-3 rounded-lg cursor-pointer transition-colors',
                            selectedVideo === index
                                ? 'bg-gray-800'
                                : 'bg-gray-900 hover:bg-gray-800',
                        ]"
                    >
                        <img
                            :src="getThumbnailUrl(prediction.url)"
                            :alt="prediction.title"
                            class="w-32 h-20 object-cover rounded"
                            loading="lazy"
                            decoding="async"
                        />
                        <div class="flex-1 min-w-0">
                            <h3 class="font-medium text-sm line-clamp-2">
                                {{
                                    prediction.title ||
                                    `VLM Prediction ${index + 1}`
                                }}
                            </h3>
                            <p class="text-xs text-gray-400 mt-1">
                                {{
                                    formatDuration(
                                        prediction.response?.metadata
                                            ?.duration || 0
                                    )
                                }}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Right column - Transcript -->
        <div class="bg-gray-900 rounded-lg p-6 overflow-y-auto">
            <div v-if="selectedVideo !== null && predictions?.[selectedVideo]">
                <h3 class="text-lg font-semibold mb-4">Transcript</h3>

                <!-- Metadata -->
                <UCard class="mb-4">
                    <div class="text-sm space-y-1">
                        <p>
                            <span class="text-gray-400">Duration:</span>
                            {{
                                formatDuration(
                                    predictions[selectedVideo].response
                                        ?.metadata?.duration || 0
                                )
                            }}
                        </p>
                        <p>
                            <span class="text-gray-400">Created:</span>
                            {{
                                formatDate(
                                    predictions[selectedVideo].created_at
                                )
                            }}
                        </p>
                    </div>
                </UCard>

                <!-- Segments -->
                <div class="space-y-3">
                    <div
                        class="bg-blue-900/20 border border-blue-800/50 rounded-lg p-3 mb-4"
                    >
                        <p
                            class="text-sm text-blue-300 flex items-center gap-2"
                        >
                            <UIcon
                                name="i-heroicons-cursor-arrow-rays"
                                class="w-5 h-5"
                            />
                            Click any timestamp button to jump to that moment in
                            the video
                        </p>
                    </div>
                    <div
                        v-for="(segment, idx) in predictions[selectedVideo]
                            .response?.segments || []"
                        :key="idx"
                        :id="`segment-${idx}`"
                        class="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-all duration-300 border border-gray-700 hover:border-gray-600"
                    >
                        <div class="flex items-center gap-2 mb-3">
                            <UButton
                                :label="formatTimestamp(segment.start_time)"
                                size="md"
                                color="primary"
                                variant="solid"
                                icon="i-heroicons-play-circle"
                                @click="seekToTime(segment.start_time)"
                                class="hover:scale-105 transition-transform flex items-center gap-x-1 cursor-pointer"
                                :ui="{ base: 'font-mono font-medium' }"
                            />
                            <UIcon
                                name="i-heroicons-arrow-right"
                                class="text-gray-500 w-4 h-4"
                            />
                            <UButton
                                :label="formatTimestamp(segment.end_time)"
                                size="md"
                                color="neutral"
                                variant="soft"
                                icon="i-heroicons-stop-circle"
                                @click="seekToTime(segment.end_time)"
                                class="hover:scale-105 transition-transform flex items-center gap-x-1 cursor-pointer"
                                :ui="{ base: 'font-mono' }"
                            />
                        </div>

                        <div v-if="segment.audio?.content" class="mb-2">
                            <p
                                class="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider"
                            >
                                Audio Transcript:
                            </p>
                            <p
                                class="text-sm leading-relaxed"
                                v-html="
                                    highlightSearchTerm(
                                        segment.audio.content,
                                        idx
                                    )
                                "
                            ></p>
                        </div>

                        <div v-if="segment.video?.content">
                            <p
                                class="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider"
                            >
                                Video Content:
                            </p>
                            <p
                                class="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed"
                                v-html="
                                    highlightSearchTerm(
                                        segment.video.content,
                                        idx
                                    )
                                "
                            ></p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else-if="pending" class="space-y-4">
                <div class="animate-pulse">
                    <div class="h-6 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 bg-[length:200%_100%] animate-shimmer rounded w-32 mb-4"></div>
                    
                    <!-- Metadata skeleton -->
                    <div class="bg-gray-800 rounded-lg p-3 mb-4">
                        <div class="space-y-2">
                            <div class="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded w-24"></div>
                            <div class="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded w-32"></div>
                        </div>
                    </div>
                    
                    <!-- Segment skeletons -->
                    <div class="space-y-3">
                        <div
                            v-for="i in 4"
                            :key="i"
                            class="bg-gray-800 rounded-lg p-4 border border-gray-700"
                        >
                            <div class="flex items-center gap-2 mb-3">
                                <div class="h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
                                <div class="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded w-4"></div>
                                <div class="h-8 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded w-16"></div>
                            </div>
                            <div class="space-y-2">
                                <div class="h-3 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded w-20"></div>
                                <div class="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded"></div>
                                <div class="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded w-4/5"></div>
                                <div class="h-4 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 bg-[length:200%_100%] animate-shimmer rounded w-3/5"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                v-else
                class="flex items-center justify-center h-full text-gray-500"
            >
                <div class="text-center">
                    <UIcon
                        name="i-heroicons-document-text"
                        class="w-12 h-12 mb-2"
                    />
                    <p>No video selected</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { videosData } from '~/data/videos'

const route = useRoute()
const selectedVideo = ref<number | null>(0) // Auto-select first video
const youtubePlayer = ref<HTMLIFrameElement | null>(null)
const currentSearchTerm = ref<string>('')
const highlightedSegmentIndex = ref<number | null>(null)

// Use state management for predictions
interface PredictionData {
    url: string
    title: string
    id: string
    created_at: string
    completed_at?: string
    status: string
    message?: string
    response?: {
        metadata?: {
            duration: number
        }
        segments?: Array<{
            start_time: number
            end_time: number
            audio?: {
                content: string
            }
            video?: {
                content: string
            }
        }>
    }
}

const predictionsState = useState<PredictionData[]>('predictions', () => [])

const batchKey = videosData.map(item => item.id).sort().join(',')

const {
    data: predictions,
    pending,
    error,
} = useLazyFetch('/api/predictions/batch', {
    method: 'POST',
    body: {
        ids: videosData.map(item => item.id),
    },
    key: `predictions-batch-${batchKey}`,
    transform: (response: any[]) => {
        return response
            .filter((item: any) => item.data !== null)
            .map((item: any, index: number) => {
                // Find the correct video data by matching IDs
                const videoData = videosData.find(video => video.id === item.id)
                return {
                    ...item.data,
                    url: videoData?.url || '',
                    title: videoData?.title || `VLM Prediction Analysis ${index + 1}`,
                }
            })
    },
    server: true,
    default: () => [],
})

// Update state when predictions are loaded
watchEffect(() => {
    if (predictions.value) {
        predictionsState.value = predictions.value
    }
})

// Handle search navigation
watch(
    () => route.query,
    query => {
        if (query.video !== undefined && query.time !== undefined) {
            const videoIndex = parseInt(query.video as string)
            const timestamp = parseInt(query.time as string)
            const segmentIndex = query.segment
                ? parseInt(query.segment as string)
                : undefined
            const searchTerm = (query.q as string) || ''

            if (!isNaN(videoIndex) && predictions.value?.[videoIndex]) {
                selectedVideo.value = videoIndex
                currentSearchTerm.value = searchTerm
                highlightedSegmentIndex.value = segmentIndex ?? null

                // Wait for video to load then seek
                nextTick(() => {
                    setTimeout(() => {
                        seekToTime(timestamp)

                        // Scroll to segment if provided
                        if (segmentIndex !== undefined) {
                            scrollToSegment(segmentIndex)
                        }
                    }, 500)
                })
            }
        }
    },
    { immediate: true }
)

function getThumbnailUrl(url: string): string {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
}

function getYouTubeEmbedUrl(url: string): string {
    const videoId = url.split('v=')[1]?.split('&')[0]
    return `https://www.youtube.com/embed/${videoId}?enablejsapi=1`
}

function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatTimestamp(seconds: number): string {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hours > 0) {
        return `${hours}:${mins.toString().padStart(2, '0')}:${secs
            .toString()
            .padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    })
}

function seekToTime(seconds: number) {
    if (!youtubePlayer.value || selectedVideo.value === null) return

    const url = predictions.value?.[selectedVideo.value]?.url
    if (!url) return

    const videoId = url.split('v=')[1]?.split('&')[0]

    // Update the iframe src with the timestamp
    youtubePlayer.value.src = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&start=${Math.floor(
        seconds
    )}&autoplay=1`
}

function scrollToSegment(segmentIndex: number) {
    // Wait a bit for the DOM to update
    setTimeout(() => {
        const segmentElement = document.getElementById(
            `segment-${segmentIndex}`
        )
        if (segmentElement) {
            segmentElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            })
            // Add highlight effect
            segmentElement.classList.add(
                'ring-2',
                'ring-primary',
                'ring-offset-2',
                'ring-offset-gray-900'
            )
            setTimeout(() => {
                segmentElement.classList.remove(
                    'ring-2',
                    'ring-primary',
                    'ring-offset-2',
                    'ring-offset-gray-900'
                )
            }, 2000)
        }
    }, 100)
}

function highlightSearchTerm(text: string, segmentIndex: number): string {
    if (
        !currentSearchTerm.value ||
        highlightedSegmentIndex.value !== segmentIndex
    ) {
        return text
    }

    const searchTerm = currentSearchTerm.value
    const regex = new RegExp(
        `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
        'gi'
    )
    return text.replace(
        regex,
        '<mark class="bg-yellow-400 text-black px-0.5 rounded font-semibold">$1</mark>'
    )
}

// Clear search term when changing videos manually
watch(selectedVideo, () => {
    currentSearchTerm.value = ''
    highlightedSegmentIndex.value = null
})
</script>
