import AsyncStorage from '@react-native-async-storage/async-storage';
import { Anime, WatchlistAnime, AnimeStatus } from '@/types/anime';

const STORAGE_KEYS = {
  WATCHLIST: 'anime_watchlist',
  IN_PROGRESS: 'anime_in_progress',
  WATCHED: 'anime_watched',
};

export const addToWatchlist = async (anime: Anime, status: AnimeStatus): Promise<void> => {
  try {
    // First, remove anime from all other lists to prevent duplicates
    await removeAnime(anime.mal_id);

    const storageKey = getStorageKey(status);
    const existingData = await AsyncStorage.getItem(storageKey);
    const parsedData = existingData ? JSON.parse(existingData) : [];
    const animeList: WatchlistAnime[] = Array.isArray(parsedData) ? parsedData : [];

    const watchlistAnime: WatchlistAnime = {
      ...anime,
      status,
      dateAdded: new Date().toISOString(),
      progress: status === 'In Progress' ? 0 : undefined,
    };

    // Check if anime already exists in current list
    const existingIndex = animeList.findIndex(item => item.mal_id === anime.mal_id);

    if (existingIndex >= 0) {
      animeList[existingIndex] = watchlistAnime;
    } else {
      animeList.push(watchlistAnime);
    }

    await AsyncStorage.setItem(storageKey, JSON.stringify(animeList));
  } catch (error) {
    console.error('Error adding to watchlist:', error);
    throw error;
  }
};

export const getWatchlistAnime = async (status: AnimeStatus): Promise<WatchlistAnime[]> => {
  try {
    const storageKey = getStorageKey(status);
    const data = await AsyncStorage.getItem(storageKey);
    const parsedData = data ? JSON.parse(data) : [];
    return Array.isArray(parsedData) ? parsedData : [];
  } catch (error) {
    console.error('Error getting watchlist anime:', error);
    return [];
  }
};

export const removeAnime = async (malId: number): Promise<void> => {
  try {
    for (const status of ['Watchlist', 'In Progress', 'Watched'] as AnimeStatus[]) {
      const storageKey = getStorageKey(status);
      const existingData = await AsyncStorage.getItem(storageKey);

      if (existingData) {
        const parsedData = existingData ? JSON.parse(existingData) : [];
        const animeList: WatchlistAnime[] = Array.isArray(parsedData) ? parsedData : [];
        const filteredList = animeList.filter(anime => anime.mal_id !== malId);
        await AsyncStorage.setItem(storageKey, JSON.stringify(filteredList));
      }
    }
  } catch (error) {
    console.error('Error removing anime:', error);
    throw error;
  }
};

export const updateAnimeStatus = async (malId: number, newStatus: AnimeStatus): Promise<void> => {
  try {
    // First, remove the anime from ALL lists to prevent duplicates
    let animeToMove: WatchlistAnime | null = null;

    for (const status of ['Watchlist', 'In Progress', 'Watched'] as AnimeStatus[]) {
      const storageKey = getStorageKey(status);
      const existingData = await AsyncStorage.getItem(storageKey);

      if (existingData) {
        const parsedData = existingData ? JSON.parse(existingData) : [];
        const animeList: WatchlistAnime[] = Array.isArray(parsedData) ? parsedData : [];
        const animeIndex = animeList.findIndex(anime => anime.mal_id === malId);

        if (animeIndex >= 0) {
          animeToMove = animeList[animeIndex];
          animeList.splice(animeIndex, 1);
          await AsyncStorage.setItem(storageKey, JSON.stringify(animeList));
        }
      }
    }

    // Now add to the new status list if anime was found
    if (animeToMove) {
      animeToMove.status = newStatus;
      animeToMove.dateAdded = new Date().toISOString();

      const newStorageKey = getStorageKey(newStatus);
      const newListData = await AsyncStorage.getItem(newStorageKey);
      const parsedNewListData = newListData ? JSON.parse(newListData) : [];
      const newList: WatchlistAnime[] = Array.isArray(parsedNewListData) ? parsedNewListData : [];

      // Double-check that this anime isn't already in the target list
      const existingIndex = newList.findIndex(anime => anime.mal_id === malId);
      if (existingIndex >= 0) {
        newList[existingIndex] = animeToMove;
      } else {
        newList.push(animeToMove);
      }

      await AsyncStorage.setItem(newStorageKey, JSON.stringify(newList));
    }
  } catch (error) {
    console.error('Error updating anime status:', error);
    throw error;
  }
};

export const getAllWatchlistAnime = async (): Promise<WatchlistAnime[]> => {
  try {
    const allAnime: WatchlistAnime[] = [];

    for (const status of ['Watchlist', 'In Progress', 'Watched'] as AnimeStatus[]) {
      const anime = await getWatchlistAnime(status);
      allAnime.push(...anime);
    }

    return allAnime;
  } catch (error) {
    console.error('Error getting all watchlist anime:', error);
    return [];
  }
};

export const checkAnimeExistence = async (malId: number): Promise<AnimeStatus | null> => {
  try {
    for (const status of ['Watchlist', 'In Progress', 'Watched'] as AnimeStatus[]) {
      const storageKey = getStorageKey(status);
      const existingData = await AsyncStorage.getItem(storageKey);

      if (existingData) {
        const parsedData = existingData ? JSON.parse(existingData) : [];
        const animeList: WatchlistAnime[] = Array.isArray(parsedData) ? parsedData : [];
        const animeExists = animeList.find(anime => anime.mal_id === malId);

        if (animeExists) {
          return status;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Error checking anime existence:', error);
    return null;
  }
};

const getStorageKey = (status: AnimeStatus): string => {
  switch (status) {
    case 'Watchlist':
      return STORAGE_KEYS.WATCHLIST;
    case 'In Progress':
      return STORAGE_KEYS.IN_PROGRESS;
    case 'Watched':
      return STORAGE_KEYS.WATCHED;
    default:
      return STORAGE_KEYS.WATCHLIST;
  }
};