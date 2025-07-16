import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AnimeCard from '@/components/AnimeCard';
import { getWatchlistAnime, updateAnimeStatus, removeAnime } from '@/services/storageService';
import { Anime, AnimeStatus } from '@/types/anime';

export default function WatchlistScreen() {
  const [activeTab, setActiveTab] = useState<AnimeStatus>('Watchlist');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const tabs: AnimeStatus[] = ['Watchlist', 'In Progress', 'Watched'];

  useEffect(() => {
    loadAnimeList();
  }, [activeTab]);

  const loadAnimeList = async () => {
    try {
      const anime = await getWatchlistAnime(activeTab);
      setAnimeList(Array.isArray(anime) ? anime : []);
    } catch (error) {
      console.error('Error loading anime list:', error);
      setAnimeList([]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnimeList();
    setRefreshing(false);
  };

  const handleSwipeAction = async (
    anime: Anime,
    action: 'watched' | 'progress' | 'remove' | 'watchlist'
  ) => {
    try {
      if (action === 'remove') {
        Alert.alert(
          'Remove Anime',
          `Remove "${anime.title}" from your list?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Remove',
              style: 'destructive',
              onPress: async () => {
                await removeAnime(anime.mal_id);
                await loadAnimeList();
              },
            },
          ]
        );
      } else {
        let newStatus: AnimeStatus;
        switch (action) {
          case 'watched':
            newStatus = 'Watched';
            break;
          case 'progress':
            newStatus = 'In Progress';
            break;
          case 'watchlist':
            newStatus = 'Watchlist';
            break;
          default:
            return;
        }
        await updateAnimeStatus(anime.mal_id, newStatus);
        await loadAnimeList();
      }
    } catch (error) {
      console.error('Error updating anime:', error);
    }
  };

  const handleStatusChange = async (anime: Anime, newStatus: AnimeStatus) => {
    try {
      await updateAnimeStatus(anime.mal_id, newStatus);
      await loadAnimeList();
    } catch (error) {
      console.error('Error updating anime status:', error);
    }
  };

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <View style={styles.itemContainer}>
      <AnimeCard
        anime={item}
        onSwipeAction={handleSwipeAction}
        onAddToWatchlist={handleStatusChange}
        showSwipeActions={true}
        showAddButton={true}
        currentStatus={activeTab}
      />
    </View>
  );

  const renderAnimeList = () => {
    if (refreshing) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      );
    }

    const safeAnimeList = Array.isArray(animeList) ? animeList : [];

    if (safeAnimeList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No anime in your {activeTab.toLowerCase()} list</Text>
        </View>
      );
    }

    return (
      <FlatList
        key="flatlist-1" // Forces re-render to avoid numColumns change error
        data={safeAnimeList}
        renderItem={renderAnimeItem}
        keyExtractor={(item, index) => item?.mal_id?.toString() || `item-${index}`}
        numColumns={1} // Show 1 item per row
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No anime in {activeTab.toLowerCase()}</Text>
          </View>
        }
      />
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.header}>
        My Anime List
      </ThemedText>

      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {renderAnimeList()}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#2e51a2',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#2e51a2',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    width: '100%', // Full width for single column layout
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

