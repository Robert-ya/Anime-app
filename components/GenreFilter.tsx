
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

const GENRES = [
  { id: '1', name: 'Action' },
  { id: '2', name: 'Adventure' },
  { id: '4', name: 'Comedy' },
  { id: '8', name: 'Drama' },
  { id: '9', name: 'Ecchi' },
  { id: '10', name: 'Fantasy' },
  { id: '12', name: 'Hentai' },
  { id: '13', name: 'Historical' },
  { id: '14', name: 'Horror' },
  { id: '22', name: 'Romance' },
  { id: '24', name: 'Sci-Fi' },
  { id: '36', name: 'Slice of Life' },
  { id: '30', name: 'Sports' },
  { id: '37', name: 'Supernatural' },
  { id: '41', name: 'Thriller' },
];

interface GenreFilterProps {
  selectedGenres: string[];
  onGenreToggle: (genres: string[]) => void;
  onApply: () => void;
}

export default function GenreFilter({
  selectedGenres,
  onGenreToggle,
  onApply,
}: GenreFilterProps) {
  const toggleGenre = (genreId: string) => {
    const newGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter(id => id !== genreId)
      : [...selectedGenres, genreId];
    onGenreToggle(newGenres);
  };

  const clearAll = () => {
    onGenreToggle([]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Genres</Text>
        <TouchableOpacity onPress={clearAll}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.genreContainer}
      >
        {GENRES.map((genre) => (
          <TouchableOpacity
            key={genre.id}
            style={[
              styles.genreChip,
              selectedGenres.includes(genre.id) && styles.selectedChip,
            ]}
            onPress={() => toggleGenre(genre.id)}
          >
            <Text
              style={[
                styles.genreText,
                selectedGenres.includes(genre.id) && styles.selectedText,
              ]}
            >
              {genre.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.applyButton} onPress={onApply}>
        <Text style={styles.applyText}>Apply Filters</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    paddingVertical: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearText: {
    fontSize: 14,
    color: '#2e51a2',
    fontWeight: '600',
  },
  genreContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  genreChip: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  selectedChip: {
    backgroundColor: '#2e51a2',
    borderColor: '#2e51a2',
  },
  genreText: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
  },
  applyButton: {
    backgroundColor: '#2e51a2',
    marginHorizontal: 16,
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
