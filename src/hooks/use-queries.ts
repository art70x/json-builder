import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { openDB } from 'idb'

export interface Dataset {
  id: number
  created: number
  json: string
  name: string
}

const DB_NAME = 'json-data-builder'
const STORE_NAME = 'datasets'
const DB_VERSION = 1

async function getDatabase() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(database) {
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        const store = database.createObjectStore(STORE_NAME, {
          keyPath: 'id',
          autoIncrement: true,
        })
        store.createIndex('name', 'name', { unique: false })
      }
    },
  })
}

async function getAllDatasets(): Promise<Dataset[]> {
  const database = await getDatabase()
  return database.getAll(STORE_NAME)
}

async function saveDataset(name: string, json: string): Promise<number> {
  const database = await getDatabase()
  const id = await database.add(STORE_NAME, {
    name,
    json,
    created: Date.now(),
  })
  return id as number
}

async function deleteDataset(id: number): Promise<void> {
  const database = await getDatabase()
  await database.delete(STORE_NAME, id)
}

export function useGetAllDatasets() {
  return useQuery<Dataset[]>({
    queryKey: ['datasets'],
    queryFn: getAllDatasets,
  })
}

export function useSaveDataset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, json }: { name: string; json: string }) => {
      return saveDataset(name, json)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}

export function useDeleteDataset() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: number) => {
      return deleteDataset(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] })
    },
  })
}
