
export interface Anime {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
      small_image_url: string;
      large_image_url: string;
    };
  };
  score: number | null;
  episodes: number | null;
  status: string;
  aired: {
    from: string;
    to: string | null;
  };
  genres: Genre[];
  synopsis: string;
  type: string;
  year: number | null;
}

export interface Genre {
  mal_id: number;
  name: string;
  type: string;
}

export interface AnimeSearchResponse {
  data: Anime[];
  pagination: {
    last_visible_page: number;
    has_next_page: boolean;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

export type AnimeStatus = 'Watchlist' | 'In Progress' | 'Watched';

export interface WatchlistAnime extends Anime {
  status: AnimeStatus;
  dateAdded: string;
  progress?: number;
}

export interface AnimeSeries {
  baseTitle: string;
  anime: Anime[];
}
