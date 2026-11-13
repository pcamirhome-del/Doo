import { useState, useEffect, useCallback } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../firebase';
import { AppItem, WishlistItem } from '../types/app';
import { getAllLocalWishlist } from '../services/indexedDbService';
import {
  addOrUpdateWishlistItem,
  deleteWishlistItem,
  syncLocalWishlistToCloud,
  subscribeToCloudWishlist,
} from '../services/wishlistSyncService';

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const refreshLocal = useCallback(async () => {
    const local = await getAllLocalWishlist();
    setItems(local);
  }, []);

  useEffect(() => {
    refreshLocal();
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthReady(true);
      if (currentUser && currentUser.emailVerified) {
        setSyncing(true);
        try {
          await syncLocalWishlistToCloud(currentUser.uid);
        } catch (err) {
          console.error('Wishlist cloud sync error:', err);
        } finally {
          setSyncing(false);
        }
      }
    });
    return () => unsubAuth();
  }, [refreshLocal]);

  useEffect(() => {
    if (!authReady || !user || !user.emailVerified) return;
    const unsubCloud = subscribeToCloudWishlist(user.uid, (mergedItems) => {
      setItems(mergedItems);
    });
    return () => unsubCloud();
  }, [authReady, user]);

  const isWishlisted = useCallback(
    (app: AppItem) => {
      const safeId = `${app.platform}_${app.id}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
      return items.some((i) => i.id === safeId || (i.appId === app.id && i.platform === app.platform));
    },
    [items]
  );

  const toggleWishlist = useCallback(
    async (app: AppItem) => {
      const safeId = `${app.platform}_${app.id}`.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120);
      const exists = items.some((i) => i.id === safeId || (i.appId === app.id && i.platform === app.platform));
      if (exists) {
        await deleteWishlistItem(safeId);
      } else {
        await addOrUpdateWishlistItem(app);
      }
      await refreshLocal();
    },
    [items, refreshLocal]
  );

  const removeById = useCallback(
    async (id: string) => {
      await deleteWishlistItem(id);
      await refreshLocal();
    },
    [refreshLocal]
  );

  return {
    wishlistItems: items,
    user,
    authReady,
    syncing,
    isWishlisted,
    toggleWishlist,
    removeById,
  };
}
