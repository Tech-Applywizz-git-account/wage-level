// API-based data processor for better server performance
import { JobData, DatabaseStats } from './supabase'

// Function to fetch data from API routes instead of direct Supabase calls
export async function fetchJobDataFromAPI(page: number = 0, pageSize: number = 1000): Promise<{
  data: JobData[]
  hasMore: boolean
  page: number
  pageSize: number
}> {
  try {
    console.log(`📡 API: Fetching page ${page} with ${pageSize} records...`)
    
    const response = await fetch(`/api/jobs?page=${page}&pageSize=${pageSize}`)
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    console.log(`✅ API: Page ${page} loaded - ${result.data.length} records`)
    return result
    
  } catch (error) {
    console.error(`❌ API Error fetching page ${page}:`, error)
    throw error
  }
}

export async function fetchSampleDataFromAPI() {
    try {
        const response = await fetch('http://localhost:3000/api/jobs?sample=true');
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching sample job data:', error);
        throw error;
    }
}


// Function to fetch sample data from API

// Function to get database statistics from API
export async function getDatabaseStatsFromAPI(): Promise<DatabaseStats> {
  try {
    console.log('📡 API: Fetching database statistics...')
    
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'stats' })
    })
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }
    
    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    console.log('✅ API: Database statistics loaded')
    return result
    
  } catch (error) {
    console.error('❌ API Error fetching database statistics:', error)
    throw error
  }
}

// Progressive data loading function
export async function loadDataProgressively(
  onProgress: (loaded: number, total: number, isComplete: boolean) => void,
  maxRecords: number = 50000 // Limit to 50k records for better performance
): Promise<JobData[]> {
  try {
    console.log(`🚀 API: Starting progressive data loading (max ${maxRecords} records)...`)
    
    let allData: JobData[] = []
    let page = 0
    const pageSize = 1000
    let hasMore = true
    
    while (hasMore && allData.length < maxRecords) {
      const remainingRecords = maxRecords - allData.length
      const currentPageSize = Math.min(pageSize, remainingRecords)
      
      console.log(`📄 API: Loading page ${page + 1} (${currentPageSize} records)...`)
      
      const result = await fetchJobDataFromAPI(page, currentPageSize)
      
      if (result.data.length === 0) {
        hasMore = false
        break
      }
      
      allData = allData.concat(result.data)
      hasMore = result.hasMore
      
      // Update progress
      onProgress(allData.length, maxRecords, !hasMore)
      
      page++
      
      // Small delay to prevent overwhelming the server
      if (page % 5 === 0) {
        console.log(`⏸️ API: Pausing briefly after ${page} pages...`)
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Safety check
      if (page > 100) {
        console.log('⚠️ API: Reached maximum page limit')
        break
      }
    }
    
    console.log(`✅ API: Progressive loading completed - ${allData.length} records`)
    return allData
    
  } catch (error) {
    console.error('❌ API Error in progressive loading:', error)
    throw error
  }
}
// export async function loadDataProgressively(
//   onProgress: (loaded: number, total: number, isComplete: boolean) => void,
//   maxRecords: number = 50000 // Limit to 50k records for better performance
// ): Promise<JobData[]> {
//   try {
//     console.log(`🚀 API: Starting progressive data loading (max ${maxRecords} records)...`)
    
//     let allData: JobData[] = []
//     let page = 0
//     const pageSize = 1000
//     let hasMore = true
    
//     while (hasMore && allData.length < maxRecords) {
//       const remainingRecords = maxRecords - allData.length
//       const currentPageSize = Math.min(pageSize, remainingRecords)
      
//       console.log(`📄 API: Loading page ${page + 1} (${currentPageSize} records)...`)
      
//       // Make sure you pass the correct arguments (page and pageSize)
//       const result = await fetchJobDataFromAPI(page, currentPageSize)
      
//       allData = [...allData, ...result]
      
//       page++
//       hasMore = result.length === currentPageSize
      
//       onProgress(allData.length, maxRecords, !hasMore)
//     }
    
//     return allData
//   } catch (error) {
//     console.error('Error in progressive data loading:', error)
//     throw error
//   }
// }


// export async function fetchJobDataFromAPI(page: number, pageSize: number): Promise<JobData[]> {
//     try {
//         const response = await fetch(`http://localhost:3000/api/jobs?page=${page}&pageSize=${pageSize}`);
//         if (!response.ok) {
//             throw new Error(`API request failed with status ${response.status}`);
//         }
//         return await response.json();
//     } catch (error) {
//         console.error('Error fetching job data:', error);
//         throw error;
//     }
// }


// Fallback function that tries full data, then sample data
export async function loadDataWithFallback(
  onProgress: (loaded: number, total: number, isComplete: boolean, isSample: boolean) => void
): Promise<{ data: JobData[], isSample: boolean }> {
  try {
    console.log('🚀 API: Attempting full data load with fallback...')
    
    // Try to load up to 50k records progressively
    const fullData = await loadDataProgressively(
      (loaded, total, isComplete) => onProgress(loaded, total, isComplete, false),
      50000
    )
    
    if (fullData.length > 0) {
      console.log(`✅ API: Full data loaded successfully - ${fullData.length} records`)
      return { data: fullData, isSample: false }
    }
    
    throw new Error('No full data received')
    
  } catch (error) {
    console.log('🔄 API: Full data failed, trying sample data...')
    
    try {
      const sampleResult = await fetchSampleDataFromAPI()
      
      if (sampleResult.data.length > 0) {
        console.log(`✅ API: Sample data loaded successfully - ${sampleResult.data.length} records`)
        onProgress(sampleResult.data.length, sampleResult.data.length, true, true)
        return { data: sampleResult.data, isSample: true }
      }
      
      throw new Error('No sample data received')
      
    } catch (sampleError) {
      console.error('❌ API: Both full and sample data failed:', sampleError)
      throw new Error('Failed to load any data from API')
    }
  }
}

// export async function loadDataWithFallback() {
//     try {
//         let page = 0;  // Starting page
//         const pageSize = 1000;  // Number of records per page

//         let allData: JobData[] = [];
//         let hasMoreData = true;

//         // Try to fetch full data first
//         while (hasMoreData) {
//             const data = await fetchJobDataFromAPI(page, pageSize);
//             if (data && data.length > 0) {
//                 allData = [...allData, ...data];
//                 page++;  // Increment page for next request
//             } else {
//                 hasMoreData = false;  // No more data to load
//             }
//         }

//         return allData;
//     } catch (error) {
//         console.error('Full data fetch failed:', error);
//         try {
//             // If full data fails, try fetching sample data
//             const sampleData = await fetchSampleDataFromAPI(0, pageSize);  // Pass page 0 for sample data
//             return sampleData;
//         } catch (sampleError) {
//             console.error('Sample data fetch also failed:', sampleError);
//             throw new Error('Failed to load any data from API!');
//         }
//     }
// }
