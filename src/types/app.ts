export type Platform = 'pc' | 'android' | 'ios';

export interface FOSSAlternative {
  name: string;
  description: string;
  license: string;
  officialUrl: string;
  wingetId?: string;
}

export interface AppItem {
  id: string;
  name: string;
  developer: string;
  platform: Platform;
  category: string;
  thumbnail: string;
  description: string;
  rating: number;
  version: string;
  size?: string;
  downloadUrl: string;
  officialUrl: string;
  directDownloadUrl: string;
  isFOSS: boolean;
  installScript?: string;
  secondarySourceUrl?: string;
  secondarySourceLabel?: string;
  wingetId?: string;
  chocoId?: string;
  packageName?: string;
  fossAlternatives?: FOSSAlternative[];
}

export interface AutocompleteSuggestion {
  id: string;
  name: string;
  developer: string;
  platform: Platform;
  thumbnail: string;
  category: string;
  officialUrl: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  appId: string;
  name: string;
  developer: string;
  platform: Platform;
  category: string;
  thumbnail: string;
  officialUrl: string;
  directDownloadUrl: string;
  secondarySourceUrl?: string;
  secondarySourceLabel?: string;
  wingetId?: string;
  chocoId?: string;
  addedAt: number;
}
