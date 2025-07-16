
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllWatchlistAnime } from './storageService';

export const exportWatchlist = async (): Promise<void> => {
  try {
    const allAnime = await getAllWatchlistAnime();
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      anime: allAnime,
    };
    
    const jsonString = JSON.stringify(exportData, null, 2);
    const fileName = `anime_watchlist_${new Date().toISOString().split('T')[0]}.json`;
    const fileUri = FileSystem.documentDirectory + fileName;
    
    await FileSystem.writeAsStringAsync(fileUri, jsonString);
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri);
    }
  } catch (error) {
    console.error('Error exporting watchlist:', error);
    throw error;
  }
};

export const importWatchlist = async (): Promise<void> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: 'application/json',
      copyToCacheDirectory: true,
    });
    
    if (result.assets && result.assets.length > 0) {
      const fileUri = result.assets[0].uri;
      const fileContent = await FileSystem.readAsStringAsync(fileUri);
      const importData = JSON.parse(fileContent);
      
      if (importData.anime && Array.isArray(importData.anime)) {
        // Clear existing data
        await AsyncStorage.multiRemove([
          'anime_watchlist',
          'anime_in_progress',
          'anime_watched',
        ]);
        
        // Group anime by status
        const groupedAnime = importData.anime.reduce((acc: any, anime: any) => {
          if (!acc[anime.status]) acc[anime.status] = [];
          acc[anime.status].push(anime);
          return acc;
        }, {});
        
        // Save grouped data
        for (const [status, animeList] of Object.entries(groupedAnime)) {
          const storageKey = getStorageKeyForStatus(status);
          await AsyncStorage.setItem(storageKey, JSON.stringify(animeList));
        }
      }
    }
  } catch (error) {
    console.error('Error importing watchlist:', error);
    throw error;
  }
};

const getStorageKeyForStatus = (status: string): string => {
  switch (status) {
    case 'Watchlist':
      return 'anime_watchlist';
    case 'In Progress':
      return 'anime_in_progress';
    case 'Watched':
      return 'anime_watched';
    default:
      return 'anime_watchlist';
  }
};
