import localforage from 'localforage';

// Configure localforage to strictly use standard INDEXEDDB driver
localforage.config({
  driver: localforage.INDEXEDDB,
  name: 'legendshub_indexeddb',
  storeName: 'game_store_v1',
  description: 'Protetor contra Quotas Excedidas - Armazenamento de Banco de Dados do Jogo'
});

/**
 * Safely retrieves an item from LocalForage (asynchronously).
 * Objects/arrays are stored and returned directly (no manual JSON.parse needed).
 */
export async function getGameItem<T>(key: string): Promise<T | null> {
  try {
    const value = await localforage.getItem<T>(key);
    return value;
  } catch (err) {
    console.warn(`[LocalForageStore] Erro ao ler chave "${key}":`, err);
    return null;
  }
}

/**
 * Safely saves an item inside LocalForage.
 * Objects/arrays are stored directly (no manual JSON.stringify needed).
 */
export async function setGameItem<T>(key: string, value: T): Promise<void> {
  try {
    await localforage.setItem(key, value);
  } catch (err) {
    console.error(`[LocalForageStore] Erro ao escrever chave "${key}":`, err);
  }
}

/**
 * Safely removes an item from LocalForage.
 */
export async function removeGameItem(key: string): Promise<void> {
  try {
    await localforage.removeItem(key);
  } catch (err) {
    console.error(`[LocalForageStore] Erro ao deletar chave "${key}":`, err);
  }
}

/**
 * Automatic Boot Migration Script:
 * Scans localStorage for old credentials/saved database keys, persists them into IndexedDB,
 * and clears them from localStorage to completely free up browser quota.
 */
export async function migrateLegacyStorage(): Promise<void> {
  if (typeof window === 'undefined') return;

  const legacyPrefixes = ['legendshub_', 'editor_database.json', 'editor_last_modified_timestamp'];
  const keys = Object.keys(localStorage);

  for (const key of keys) {
    const isLegacy = legacyPrefixes.some(prefix => key.startsWith(prefix));
    if (isLegacy) {
      try {
        const raw = localStorage.getItem(key);
        if (raw !== null) {
          let convertedValue: any = raw;
          
          // Try parsing JSON to store actual JavaScript objects directly (as required)
          if (typeof raw === 'string') {
            try {
              if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
                convertedValue = JSON.parse(raw);
              }
            } catch (_) {
              // Stay as plain string
            }
          }
          
          await localforage.setItem(key, convertedValue);
          localStorage.removeItem(key);
          console.log(`[Storage Migration] Sucesso: Chave "${key}" migrada com sucesso para IndexedDB.`);
        }
      } catch (err) {
        console.error(`[Storage Migration] Erro ao migrar chave "${key}":`, err);
      }
    }
  }
}
