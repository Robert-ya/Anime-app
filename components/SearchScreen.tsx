import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
} from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import AnimeCard from '@/components/AnimeCard';
import GenreFilter from '@/components/GenreFilter';
import { searchAnime } from '@/services/animeService';
import { addToWatchlist } from '@/services/storageService';
import { Anime, AnimeStatus } from '@/types/anime';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(async (query: string, genres: string[], pageNum: number = 1, reset: boolean = true) => {
    if (pageNum === 1) setLoading(true);

    try {
      const response = await searchAnime(query, genres, pageNum);
      if (reset) {
        setAnimeList(response.data);
      } else {
        setAnimeList(prev => [...prev, ...response.data]);
      }
      setHasNextPage(response.pagination.has_next_page);
      setPage(pageNum);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleSearch = useCallback(() => {
    if (searchQuery.trim() || selectedGenres.length > 0) {
      performSearch(searchQuery, selectedGenres, 1, true);
    }
  }, [searchQuery, selectedGenres, performSearch]);

  const loadMore = useCallback(() => {
    if (!loading && hasNextPage) {
      performSearch(searchQuery, selectedGenres, page + 1, false);
    }
  }, [loading, hasNextPage, searchQuery, selectedGenres, page, performSearch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    performSearch(searchQuery, selectedGenres, 1, true);
  }, [searchQuery, selectedGenres, performSearch]);

  const handleAddToWatchlist = async (anime: Anime, status: AnimeStatus) => {
    try {
      await addToWatchlist(anime, status);
    } catch (error) {
      console.error('Error adding to watchlist:', error);
    }
  };

  const renderAnimeItem = ({ item }: { item: Anime }) => (
    <View style={styles.itemContainer}>
      <AnimeCard
        anime={item}
        onAddToWatchlist={handleAddToWatchlist}
        showAddButton={true}
      />
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search anime..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Text style={styles.filterButtonText}>Filters</Text>
        </TouchableOpacity>
      </View>

      {showFilters && (
        <GenreFilter
          selectedGenres={selectedGenres}
          onGenreToggle={(genres) => setSelectedGenres(genres)}
          onApply={handleSearch}
        />
      )}

      <FlatList
        key="flatlist-1" // ✅ Forces a reset to avoid numColumns error
        data={animeList}
        renderItem={renderAnimeItem}
        keyExtractor={(item) => item.mal_id.toString()}
        numColumns={1} // ✅ 1 item per row
        contentContainerStyle={styles.listContainer}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Search for anime to get started!</Text>
            </View>
          ) : null
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  filterButton: {
    backgroundColor: '#2e51a2',
    paddingHorizontal: 16,
    justifyContent: 'center',
    borderRadius: 8,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  itemContainer: {
    width: '100%', // ✅ Full width for 1-column layout
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
    textAlign: 'center',
  },
});

