<template>
  <NuxtLink :to="`/watch/${index}`" class="group cursor-pointer block">
    <div class="relative aspect-video bg-gray-900 rounded-xl overflow-hidden mb-3 group-hover:rounded-none transition-all duration-200">
      <img
        :src="getThumbnailUrl(video.url)"
        :alt="`Video ${index + 1}`"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <div class="absolute bottom-2 right-2 bg-black/90 text-white text-xs px-1.5 py-0.5 rounded font-medium">
        {{ formatDuration(video.duration || 240) }}
      </div>
    </div>
    
    <div class="flex gap-3">
      <UAvatar
        :src="`https://api.dicebear.com/7.x/initials/svg?seed=Channel${index}`"
        size="sm"
      />
      
      <div class="flex-1 min-w-0">
        <h3 class="font-medium text-white line-clamp-2 mb-1 text-sm leading-snug">
          {{ video.title || `VLM Prediction Analysis ${index + 1}` }}
        </h3>
        <div class="text-xs text-gray-400 space-y-0.5">
          <p class="hover:text-gray-300">
            {{ video.channel || 'VLM Run Official' }}
          </p>
          <p>
            {{ formatViews(video.views || Math.floor(Math.random() * 100000)) }} • {{ formatDate(video.created_at) }}
          </p>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  video: any
  index: number
}

defineProps<Props>()

function getThumbnailUrl(url: string): string {
  const videoId = url.split('v=')[1]?.split('&')[0]
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
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