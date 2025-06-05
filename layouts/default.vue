<template>
  <div class="min-h-screen bg-gray-950 text-white flex flex-col">
    <AppHeader 
      :predictions="predictions" 
      @select-result="handleSearchResult" 
    />
    
    <main class="flex-1 mt-14 p-4 md:p-6 overflow-hidden">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()

// Get predictions from the page data
const predictions = useState<any[]>('predictions', () => [])

function handleSearchResult(result: any) {
  // Navigate to home page with query params for video, timestamp, segment, and search query
  router.push({
    path: '/',
    query: {
      video: result.videoIndex.toString(),
      time: result.timestamp.toString(),
      segment: result.segmentIndex.toString(),
      q: result.searchQuery || ''
    }
  })
}
</script>