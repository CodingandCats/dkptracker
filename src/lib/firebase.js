import { initializeApp } from 'firebase/app'
import { getDatabase, ref, push, set, get, query, orderByChild, onValue, off } from 'firebase/database'

const firebaseConfig = {
  databaseURL: 'https://dkptracker-6121c-default-rtdb.firebaseio.com/'
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

// Helper functions to mimic Supabase-like API
export const firebase = {
  from: (table) => ({
    select: (fields = '*') => ({
      eq: (column, value) => ({
        single: async () => {
          const dbRef = ref(database, table)
          const snapshot = await get(query(dbRef, orderByChild(column)))
          const data = snapshot.val()
          
          if (!data) return { data: null, error: null }
          
          // Find the matching record
          const matchingKey = Object.keys(data).find(key => data[key][column] === value)
          if (!matchingKey) return { data: null, error: null }
          
          return { 
            data: { id: matchingKey, ...data[matchingKey] }, 
            error: null 
          }
        }
      }),
      order: (column, options = {}) => ({
        async then(callback) {
          const dbRef = ref(database, table)
          const snapshot = await get(dbRef)
          const data = snapshot.val()
          
          if (!data) return callback({ data: [], error: null })
          
          // Convert to array and sort
          let results = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }))
          
          results.sort((a, b) => {
            if (options.ascending === false) {
              return b[column] - a[column]
            }
            return a[column] - b[column]
          })
          
          return callback({ data: results, error: null })
        }
      })
    }),
    insert: async (newData) => {
      try {
        const dbRef = ref(database, table)
        const newRef = push(dbRef)
        
        // Add timestamps
        const dataWithTimestamps = {
          ...newData,
          created_at: new Date().toISOString()
        }
        
        await set(newRef, dataWithTimestamps)
        return { 
          data: { id: newRef.key, ...dataWithTimestamps }, 
          error: null 
        }
      } catch (error) {
        return { data: null, error }
      }
    },
    update: (updates) => ({
      eq: async (column, value) => {
        try {
          const dbRef = ref(database, table)
          const snapshot = await get(dbRef)
          const data = snapshot.val()
          
          if (!data) return { data: null, error: new Error('No data found') }
          
          // Find the matching record
          const matchingKey = Object.keys(data).find(key => data[key][column] === value)
          if (!matchingKey) return { data: null, error: new Error('Record not found') }
          
          // Update the record
          const recordRef = ref(database, `${table}/${matchingKey}`)
          await set(recordRef, { ...data[matchingKey], ...updates })
          
          return { data: { id: matchingKey, ...data[matchingKey], ...updates }, error: null }
        } catch (error) {
          return { data: null, error }
        }
      }
    })
  })
}

// Real-time subscription helper
export const subscribeToTable = (table, callback) => {
  const dbRef = ref(database, table)
  const unsubscribe = onValue(dbRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      const results = Object.keys(data).map(key => ({
        id: key,
        ...data[key]
      }))
      callback(results)
    } else {
      callback([])
    }
  })
  
  return () => off(dbRef, 'value', unsubscribe)
}