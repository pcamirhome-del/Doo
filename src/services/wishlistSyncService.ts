import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { AppItem, WishlistItem } from '../types/app';
import {
  getAllLocalWishlist,
  saveLocalWishlistItem,
  removeLocalWishlistItem,
} from './indexedDbService';

function sanitizeId(raw: string): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 120) || 'item_default';
}

function truncateStr(val: string | undefined, max: number, fallback = ''): string {
  const str = (val ?? fallback).trim();
  if (!str) return fallback;
  return str.slice(0, max);
}

export function createWishlistItemFromApp(app: AppItem, userId = 'local_user'): WishlistItem {
  const safeId = sanitizeId(`${app.platform}_${app.id}`);
  return {
    id: safeId,
    userId: sanitizeId(userId),
    appId: truncateStr(app.id, 128, safeId),
    name: truncateStr(app.name, 200, 'Application'),
    developer: truncateStr(app.developer, 200, 'Verified Publisher'),
    platform: app.platform,
    category: truncateStr(app.category, 120, 'General'),
    thumbnail: truncateStr(app.thumbnail, 2048, 'https://ui-avatars.com/api/?name=App'),
    officialUrl: truncateStr(app.officialUrl, 2048, 'https://microsoft.com'),
    directDownloadUrl: truncateStr(app.directDownloadUrl || app.officialUrl, 2048, 'https://microsoft.com'),
    ...(app.secondarySourceUrl ? { secondarySourceUrl: truncateStr(app.secondarySourceUrl, 2048) } : {}),
    ...(app.secondarySourceLabel ? { secondarySourceLabel: truncateStr(app.secondarySourceLabel, 120) } : {}),
    ...(app.wingetId ? { wingetId: truncateStr(app.wingetId, 160) } : {}),
    ...(app.chocoId ? { chocoId: truncateStr(app.chocoId, 160) } : {}),
    addedAt: Date.now(),
  };
}

export async function addOrUpdateWishlistItem(app: AppItem): Promise<WishlistItem> {
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid || 'local_user';
  const item = createWishlistItemFromApp(app, userId);

  // 1. Always persist immediately to IndexedDB for offline-first PWA responsiveness
  await saveLocalWishlistItem(item);

  // 2. If signed in with verified email, sync to Firestore
  if (currentUser && currentUser.emailVerified) {
    const docPath = `users/${currentUser.uid}/wishlist/${item.id}`;
    try {
      const firestorePayload: Record<string, unknown> = {
        id: item.id,
        userId: currentUser.uid,
        appId: item.appId,
        name: item.name,
        developer: item.developer,
        platform: item.platform,
        category: item.category,
        thumbnail: item.thumbnail,
        officialUrl: item.officialUrl,
        directDownloadUrl: item.directDownloadUrl,
        addedAt: item.addedAt,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      if (item.secondarySourceUrl) firestorePayload.secondarySourceUrl = item.secondarySourceUrl;
      if (item.secondarySourceLabel) firestorePayload.secondarySourceLabel = item.secondarySourceLabel;
      if (item.wingetId) firestorePayload.wingetId = item.wingetId;
      if (item.chocoId) firestorePayload.chocoId = item.chocoId;

      await setDoc(doc(db, 'users', currentUser.uid, 'wishlist', item.id), firestorePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }

  return item;
}

export async function deleteWishlistItem(itemId: string): Promise<void> {
  const safeId = sanitizeId(itemId);
  await removeLocalWishlistItem(safeId);

  const currentUser = auth.currentUser;
  if (currentUser && currentUser.emailVerified) {
    const docPath = `users/${currentUser.uid}/wishlist/${safeId}`;
    try {
      await deleteDoc(doc(db, 'users', currentUser.uid, 'wishlist', safeId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, docPath);
    }
  }
}

export async function syncLocalWishlistToCloud(userId: string): Promise<void> {
  if (!auth.currentUser || !auth.currentUser.emailVerified || auth.currentUser.uid !== userId) {
    return;
  }
  const localItems = await getAllLocalWishlist();
  const collectionPath = `users/${userId}/wishlist`;

  try {
    const existingSnap = await getDocs(collection(db, 'users', userId, 'wishlist'));
    const remoteIds = new Set<string>();
    existingSnap.forEach((docSnap) => {
      remoteIds.add(docSnap.id);
    });

    for (const localItem of localItems) {
      const safeId = sanitizeId(localItem.id);
      if (!remoteIds.has(safeId)) {
        const updatedItem: WishlistItem = {
          ...localItem,
          id: safeId,
          userId,
        };
        await saveLocalWishlistItem(updatedItem);

        const payload: Record<string, unknown> = {
          id: safeId,
          userId,
          appId: truncateStr(updatedItem.appId, 128, safeId),
          name: truncateStr(updatedItem.name, 200, 'Application'),
          developer: truncateStr(updatedItem.developer, 200, 'Publisher'),
          platform: updatedItem.platform,
          category: truncateStr(updatedItem.category, 120, 'General'),
          thumbnail: truncateStr(updatedItem.thumbnail, 2048, 'https://ui-avatars.com/api/?name=App'),
          officialUrl: truncateStr(updatedItem.officialUrl, 2048, 'https://microsoft.com'),
          directDownloadUrl: truncateStr(updatedItem.directDownloadUrl, 2048, 'https://microsoft.com'),
          addedAt: updatedItem.addedAt || Date.now(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        if (updatedItem.secondarySourceUrl) payload.secondarySourceUrl = truncateStr(updatedItem.secondarySourceUrl, 2048);
        if (updatedItem.secondarySourceLabel) payload.secondarySourceLabel = truncateStr(updatedItem.secondarySourceLabel, 120);
        if (updatedItem.wingetId) payload.wingetId = truncateStr(updatedItem.wingetId, 160);
        if (updatedItem.chocoId) payload.chocoId = truncateStr(updatedItem.chocoId, 160);

        await setDoc(doc(db, 'users', userId, 'wishlist', safeId), payload);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, collectionPath);
  }
}

export function subscribeToCloudWishlist(
  userId: string,
  onUpdate: (items: WishlistItem[]) => void
): () => void {
  const collectionPath = `users/${userId}/wishlist`;
  const colRef = collection(db, 'users', userId, 'wishlist');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      const cloudItems: WishlistItem[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        cloudItems.push({
          id: data.id,
          userId: data.userId,
          appId: data.appId,
          name: data.name,
          developer: data.developer,
          platform: data.platform,
          category: data.category,
          thumbnail: data.thumbnail,
          officialUrl: data.officialUrl,
          directDownloadUrl: data.directDownloadUrl,
          secondarySourceUrl: data.secondarySourceUrl,
          secondarySourceLabel: data.secondarySourceLabel,
          wingetId: data.wingetId,
          chocoId: data.chocoId,
          addedAt: typeof data.addedAt === 'number' ? data.addedAt : Date.now(),
        });
      });

      for (const item of cloudItems) {
        await saveLocalWishlistItem(item);
      }

      const merged = await getAllLocalWishlist();
      onUpdate(merged);
    },
    (error) => {
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  );
}
