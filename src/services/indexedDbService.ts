import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { WishlistItem, AppItem, Platform } from '../types/app';

interface NexusDeployDB extends DBSchema {
  wishlist: {
    key: string;
    value: WishlistItem;
    indexes: {
      'by-platform': Platform;
      'by-addedAt': number;
    };
  };
  searchCache: {
    key: string;
    value: {
      cacheKey: string;
      results: AppItem[];
      timestamp: number;
    };
  };
}

const DB_NAME = 'nexus-deploy-pwa-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<NexusDeployDB>> | null = null;

function getDB(): Promise<IDBPDatabase<NexusDeployDB>> {
  if (!dbPromise) {
    dbPromise = openDB<NexusDeployDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('wishlist')) {
          const wishlistStore = db.createObjectStore('wishlist', { keyPath: 'id' });
          wishlistStore.createIndex('by-platform', 'platform');
          wishlistStore.createIndex('by-addedAt', 'addedAt');
        }
        if (!db.objectStoreNames.contains('searchCache')) {
          db.createObjectStore('searchCache', { keyPath: 'cacheKey' });
        }
      },
    });
  }
  return dbPromise;
}

export async function getAllLocalWishlist(): Promise<WishlistItem[]> {
  const db = await getDB();
  const items = await db.getAll('wishlist');
  return items.sort((a, b) => b.addedAt - a.addedAt);
}

export async function saveLocalWishlistItem(item: WishlistItem): Promise<void> {
  const db = await getDB();
  await db.put('wishlist', item);
}

export async function removeLocalWishlistItem(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('wishlist', id);
}

export async function clearAndReplaceLocalWishlist(items: WishlistItem[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('wishlist', 'readwrite');
  await tx.store.clear();
  for (const item of items) {
    await tx.store.put(item);
  }
  await tx.done;
}

export async function getCachedSearchResults(cacheKey: string): Promise<AppItem[] | null> {
  try {
    const db = await getDB();
    const entry = await db.get('searchCache', cacheKey);
    if (!entry) return null;
    // Valid for 24 hours offline/online cache
    if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
      return entry.results;
    }
    return entry.results;
  } catch {
    return null;
  }
}

export async function setCachedSearchResults(cacheKey: string, results: AppItem[]): Promise<void> {
  try {
    const db = await getDB();
    await db.put('searchCache', {
      cacheKey,
      results,
      timestamp: Date.now(),
    });
  } catch {
    // Ignore storage quota errors in private browsing
  }
}
