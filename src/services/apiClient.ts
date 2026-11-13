import { AppItem, Platform } from '../types/app';
import { getCachedSearchResults, setCachedSearchResults } from './indexedDbService';

const API_BASE_URL = '/api';

export const apiClient = {
  /**
   * Fetches real-time search suggestions with thumbnails
   */
  async getAutocomplete(query: string, platform: Platform): Promise<AppItem[]> {
    if (!query || !query.trim()) return [];
    try {
      const response = await fetch(
        `${API_BASE_URL}/autocomplete?q=${encodeURIComponent(query.trim())}&platform=${platform}`
      );
      const json = await response.json();
      return json.success && Array.isArray(json.data) ? json.data : [];
    } catch (error) {
      console.error('Autocomplete Error:', error);
      const cached = await getCachedSearchResults(`search:${platform}:${query.trim().toLowerCase()}`);
      return cached ? cached.slice(0, 5) : [];
    }
  },

  /**
   * Performs a deep search across selected platform stores with IndexedDB offline fallback
   */
  async searchApps(query: string, platform: Platform): Promise<AppItem[]> {
    if (!query || !query.trim()) return [];
    const cacheKey = `search:${platform}:${query.trim().toLowerCase()}`;
    try {
      const response = await fetch(
        `${API_BASE_URL}/search?q=${encodeURIComponent(query.trim())}&platform=${platform}`
      );
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        await setCachedSearchResults(cacheKey, json.data);
        return json.data;
      }
      return (await getCachedSearchResults(cacheKey)) || [];
    } catch (error) {
      console.error('Search API Error:', error);
      return (await getCachedSearchResults(cacheKey)) || [];
    }
  },

  /**
   * Fetches 15 items for the dynamic homepage carousels with IndexedDB offline fallback
   */
  async getCarousel(category: 'social' | 'editing', platform: Platform): Promise<AppItem[]> {
    const cacheKey = `carousel:${platform}:${category}`;
    try {
      const response = await fetch(
        `${API_BASE_URL}/carousel?category=${category}&platform=${platform}`
      );
      const json = await response.json();
      if (json.success && Array.isArray(json.data)) {
        await setCachedSearchResults(cacheKey, json.data);
        return json.data;
      }
      return (await getCachedSearchResults(cacheKey)) || [];
    } catch (error) {
      console.error('Carousel API Error:', error);
      return (await getCachedSearchResults(cacheKey)) || [];
    }
  },
};
