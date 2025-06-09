<template>
  <div class="max-w-[1800px] mx-auto">
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main video content -->
      <div class="lg:col-span-2">
        <!-- Video player -->
        <div class="aspect-video bg-black rounded-xl overflow-hidden mb-4">
          <iframe
            v-if="currentVideo"
            :src="getYouTubeEmbedUrl(currentVideo.url)"
            :title="currentVideo.title || `VLM Prediction Analysis ${videoId}`"
            class="w-full h-full"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
        
        <!-- Video info -->
        <div v-if="currentVideo" class="mb-4">
          <h1 class="text-xl font-semibold mb-4">
            {{ currentVideo.title || `VLM Prediction Analysis ${videoId}` }}
          </h1>
          
          <!-- Prediction Data -->
          <UCard :ui="{ base: 'bg-gray-900', body: { padding: 'p-4' } }">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Prediction Data</h3>
              <UButton
                :icon="showPredictionData ? 'i-heroicons-chevron-up' : 'i-heroicons-chevron-down'"
                color="gray"
                variant="ghost"
                size="sm"
                @click="showPredictionData = !showPredictionData"
              />
            </div>
            
            <div v-if="showPredictionData" class="bg-gray-950 rounded-lg p-4 overflow-auto max-h-96">
              <pre class="text-sm"><code>{{ formattedJson }}</code></pre>
            </div>
          </UCard>
        </div>
      </div>
      
      <!-- Sidebar recommendations -->
      <div class="lg:col-span-1">
        <h3 class="font-semibold mb-4">Related Videos</h3>
        <div class="space-y-4">
          <NuxtLink
            v-for="(video, index) in otherVideos"
            :key="index"
            :to="`/watch/${index}`"
            class="flex gap-3 group"
          >
            <div class="relative w-40 aspect-video bg-gray-800 rounded-lg overflow-hidden flex-shrink-0">
              <img
                :src="getThumbnailUrl(video.url)"
                :alt="`Video ${index + 1}`"
                class="w-full h-full object-cover"
              />
              <div class="absolute bottom-1 right-1 bg-black/80 text-white text-xs px-1 py-0.5 rounded">
                {{ formatDuration(video.duration || 240) }}
              </div>
            </div>
            
            <div class="flex-1">
              <h4 class="text-sm font-semibold line-clamp-2 mb-1">
                {{ video.title || `VLM Prediction Analysis ${index + 1}` }}
              </h4>
              <p class="text-xs text-gray-400">VLM Run Official</p>
              <p class="text-xs text-gray-400">
                {{ formatViews(video.views || Math.floor(Math.random() * 100000)) }} • 
                {{ formatDate(video.created_at) }}
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { videosData } from '~/data/videos'

const route = useRoute()
const videoId = computed(() => parseInt(route.params.id as string))
const showPredictionData = ref(false)

const { data: predictions } = await useFetch('/api/predictions/batch', {
  method: 'POST',
  body: {
    ids: videosData.map(item => item.id)
  },
  transform: (response) => {
    return response
      .filter(item => item.data !== null)
      .map((item, index) => ({
        ...item.data,
        url: videosData[index].url,
        title: `VLM Prediction Analysis ${index + 1}`,
        channel: 'VLM Run Official',
        views: Math.floor(Math.random() * 100000) + 1000,
        duration: Math.floor(Math.random() * 600) + 60
      }))
  },
  server: true
})

const currentVideo = computed(() => predictions.value?.[videoId.value])
const otherVideos = computed(() => predictions.value?.filter((_, index) => index !== videoId.value) || [])

const formattedJson = computed(() => {
  if (!currentVideo.value) return '{}'
  return JSON.stringify(currentVideo.value, null, 2)
})

function getYouTubeEmbedUrl(url: string): string {
  const videoId = url.split('v=')[1]?.split('&')[0]
  return `https://www.youtube.com/embed/${videoId}`
}

function getThumbnailUrl(url: string): string {
  const videoId = url.split('v=')[1]?.split('&')[0]
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatViews(views: number): string {
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M views`
  } else if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K views`
  }
  return `${views} views`
}

function formatDate(date: string | undefined): string {
  if (!date) return '2 days ago'
  const diff = Date.now() - new Date(date).getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
}
</script>