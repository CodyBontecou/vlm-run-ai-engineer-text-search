interface SearchIndexEntry {
    videoIndex: number
    videoTitle: string
    segmentIndex: number
    timestamp: number
    content: string
    type: 'audio' | 'video'
}

export function useSearchIndex(predictions: Ref<any[]>) {
    const searchIndex = computed(() => {
        const index = new Map<string, SearchIndexEntry[]>()
        
        if (!predictions.value || !Array.isArray(predictions.value)) {
            return index
        }
        
        predictions.value.forEach((prediction: any, videoIndex: number) => {
            const videoTitle = prediction.title || `VLM Prediction ${videoIndex + 1}`
            
            prediction.response?.segments?.forEach((segment: any, segmentIndex: number) => {
                // Index audio content
                if (segment.audio?.content) {
                    const words = segment.audio.content
                        .toLowerCase()
                        .replace(/[^\w\s]/g, ' ')
                        .split(/\s+/)
                        .filter(word => word.length > 2) // Skip very short words
                    
                    words.forEach(word => {
                        if (!index.has(word)) {
                            index.set(word, [])
                        }
                        index.get(word)!.push({
                            videoIndex,
                            videoTitle,
                            segmentIndex,
                            timestamp: segment.start_time || 0,
                            content: segment.audio.content,
                            type: 'audio'
                        })
                    })
                }
                
                // Index video content
                if (segment.video?.content) {
                    const words = segment.video.content
                        .toLowerCase()
                        .replace(/[^\w\s]/g, ' ')
                        .split(/\s+/)
                        .filter(word => word.length > 2)
                    
                    words.forEach(word => {
                        if (!index.has(word)) {
                            index.set(word, [])
                        }
                        index.get(word)!.push({
                            videoIndex,
                            videoTitle,
                            segmentIndex,
                            timestamp: segment.start_time || 0,
                            content: segment.video.content,
                            type: 'video'
                        })
                    })
                }
            })
        })
        
        return index
    })
    
    const searchIndexOptimized = (query: string, limit: number = 10): SearchIndexEntry[] => {
        if (!query || query.length < 2) return []
        
        const queryWords = query
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 0)
        
        if (queryWords.length === 0) return []
        
        // Get results for each query word
        const wordResults = queryWords.map(word => {
            const results: SearchIndexEntry[] = []
            
            // Exact matches first
            if (searchIndex.value.has(word)) {
                results.push(...searchIndex.value.get(word)!)
            }
            
            // Partial matches
            for (const [indexWord, entries] of searchIndex.value.entries()) {
                if (indexWord.includes(word) && indexWord !== word) {
                    results.push(...entries)
                }
            }
            
            return results
        })
        
        // Find intersections for multi-word queries
        if (wordResults.length === 1) {
            return wordResults[0].slice(0, limit)
        }
        
        // For multi-word queries, prefer results that match multiple words
        const resultMap = new Map<string, { entry: SearchIndexEntry; score: number }>()
        
        wordResults.forEach((results, wordIndex) => {
            results.forEach(entry => {
                const key = `${entry.videoIndex}-${entry.segmentIndex}-${entry.type}`
                
                if (resultMap.has(key)) {
                    resultMap.get(key)!.score += 1
                } else {
                    resultMap.set(key, { entry, score: 1 })
                }
            })
        })
        
        // Sort by score (number of matching words) and return
        return Array.from(resultMap.values())
            .sort((a, b) => b.score - a.score)
            .map(item => item.entry)
            .slice(0, limit)
    }
    
    return {
        searchIndex: searchIndexOptimized
    }
}