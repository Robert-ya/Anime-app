import { AnimeSearchResponse } from '@/types/anime';

const API_BASE_URL = 'https://api.jikan.moe/v4';

export const searchAnime = async (query: string, genres: string[] = [], page: number = 1): Promise<AnimeSearchResponse> => {
  try {
    let url = `${API_BASE_URL}/anime?page=${page}&limit=20`;

    if (query.trim()) {
      url += `&q=${encodeURIComponent(query)}`;
    }

    if (genres.length > 0) {
      url += `&genres=${genres.join(',')}`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // Group anime by series (removing season indicators)
    const groupedAnime = groupAnimeBySeries(data.data);

    return {
      ...data,
      data: groupedAnime,
    };
  } catch (error) {
    console.error('Error searching anime:', error);
    throw error;
  }
};

const groupAnimeBySeries = (animeList: any[]): any[] => {
  const seriesMap = new Map<string, any[]>();

  animeList.forEach(anime => {
    // Extract base series name by removing common season indicators
    const baseTitle = anime.title
      .replace(/\s+(Season\s+\d+|S\d+|\d+nd\s+Season|\d+rd\s+Season|\d+th\s+Season)/gi, '')
      .replace(/\s+(Part\s+\d+|P\d+|\d+nd\s+Part|\d+rd\s+Part|\d+th\s+Part)/gi, '')
      .replace(/\s+(OVA|Movie|Special|TV)/gi, '')
      .replace(/\s+II+$/gi, '') // Remove Roman numerals at end
      .replace(/\s+\d+$/gi, '') // Remove trailing numbers
      .replace(/:\s*\w+/gi, '') // Remove subtitle after colon
      .trim();

    if (!seriesMap.has(baseTitle)) {
      seriesMap.set(baseTitle, []);
    }
    seriesMap.get(baseTitle)!.push({
      ...anime,
      originalTitle: anime.title,
      baseTitle: baseTitle
    });
  });

  // Return the first (usually most popular) anime from each series
  return Array.from(seriesMap.values()).map(series => {
    // Sort by score and return the highest rated one
    const bestAnime = series.sort((a, b) => (b.score || 0) - (a.score || 0))[0];
    // Add series info
    return {
      ...bestAnime,
      seriesCount: series.length,
      allSeries: series
    };
  });
};

export const getAnimeById = async (id: number) => {
  try {
    const response = await fetch(`${API_BASE_URL}/anime/${id}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('Error fetching anime by ID:', error);
    throw error;
  }
};

export const getTopAnime = async (page: number = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/top/anime?page=${page}&limit=20`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching top anime:', error);
    throw error;
  }
};