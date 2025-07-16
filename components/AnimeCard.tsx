import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { PanGestureHandler, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { Anime, AnimeStatus } from '@/types/anime';

interface AnimeCardProps {
  anime: Anime;
  onAddToWatchlist?: (anime: Anime, status: AnimeStatus) => void;
  onSwipeAction?: (anime: Anime, action: 'watched' | 'progress' | 'remove' | 'watchlist') => void;
  showAddButton?: boolean;
  showSwipeActions?: boolean;
  currentStatus?: AnimeStatus;
}

export default function AnimeCard({
  anime,
  onAddToWatchlist,
  onSwipeAction,
  showAddButton = false,
  showSwipeActions = false,
  currentStatus,
}: AnimeCardProps) {
  const translateX = useSharedValue(0);

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!onSwipeAction || !currentStatus) return;

    if (direction === 'right') {
      // Right swipe actions based on current status
      if (currentStatus === 'Watchlist') {
        onSwipeAction(anime, 'progress');
      } else if (currentStatus === 'In Progress') {
        onSwipeAction(anime, 'watched');
      } else {
        onSwipeAction(anime, 'remove');
      }
    } else {
      // Left swipe actions based on current status
      if (currentStatus === 'Watched') {
        onSwipeAction(anime, 'progress');
      } else if (currentStatus === 'In Progress') {
        onSwipeAction(anime, 'watchlist');
      } else {
        onSwipeAction(anime, 'remove');
      }
    }
  };

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context) => {
      context.startX = translateX.value;
    },
    onActive: (event, context) => {
      if (showSwipeActions) {
        translateX.value = context.startX + event.translationX;
      }
    },
    onEnd: (event) => {
      if (showSwipeActions) {
        const threshold = 100;
        if (event.translationX > threshold) {
          runOnJS(handleSwipe)('right');
        } else if (event.translationX < -threshold) {
          runOnJS(handleSwipe)('left');
        }
        translateX.value = withSpring(0);
      }
    },
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const showAddOptions = () => {
    if (!onAddToWatchlist) return;

    Alert.alert(
      'Add to List',
      `Add "${anime.title}" to:`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Watchlist', onPress: () => onAddToWatchlist(anime, 'Watchlist') },
        { text: 'In Progress', onPress: () => onAddToWatchlist(anime, 'In Progress') },
        { text: 'Watched', onPress: () => onAddToWatchlist(anime, 'Watched') },
      ]
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <Image
            source={{ uri: anime.images.jpg.image_url }}
            style={styles.image}
            resizeMode="cover"
          />
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {anime.title}
            </Text>
            <Text style={styles.episodes}>
              Episodes: {anime.episodes || 'Unknown'}
            </Text>
            <Text style={styles.score}>
              Score: {anime.score || 'N/A'}
            </Text>
            {showAddButton && (
              <View style={styles.actionButtonsContainer}>
                {currentStatus !== 'Watchlist' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.watchlistButton]} 
                    onPress={() => onAddToWatchlist?.(anime, 'Watchlist')}
                  >
                    <Text style={styles.actionButtonText}>📝</Text>
                  </TouchableOpacity>
                )}
                {currentStatus !== 'In Progress' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.progressButton]} 
                    onPress={() => onAddToWatchlist?.(anime, 'In Progress')}
                  >
                    <Text style={styles.actionButtonText}>⏳</Text>
                  </TouchableOpacity>
                )}
                {currentStatus !== 'Watched' && (
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.completedButton]} 
                    onPress={() => onAddToWatchlist?.(anime, 'Watched')}
                  >
                    <Text style={styles.actionButtonText}>✅</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 200,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  episodes: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  score: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
  },
  watchlistButton: {
    backgroundColor: '#2e51a2',
  },
  progressButton: {
    backgroundColor: '#ff9500',
  },
  completedButton: {
    backgroundColor: '#34c759',
  },
});