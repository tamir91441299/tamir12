import { Movie } from '../types';

export interface MoviePackage {
  id: 'anime' | 'movie' | 'full_vip';
  title: string;
  description: string;
  price: number;
  durationDays: number;
  badge: string;
  color: string;
}

export const fetchMoviesFromBackend = async (type?: string, search?: string): Promise<Movie[]> => {
  try {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (search) params.append('search', search);

    const response = await fetch(`/api/movies?${params.toString()}`);
    const data = await response.json();
    if (data.success && Array.isArray(data.movies)) {
      return data.movies;
    }
    return [];
  } catch (error) {
    console.error('Error fetching movies from backend:', error);
    return [];
  }
};

export const fetchPackagesFromBackend = async (): Promise<MoviePackage[]> => {
  try {
    const response = await fetch('/api/packages');
    const data = await response.json();
    if (data.success && Array.isArray(data.packages)) {
      return data.packages;
    }
    return [];
  } catch (error) {
    console.error('Error fetching packages:', error);
    return [];
  }
};

export const verifyPaymentApi = async (
  packageType: 'anime' | 'movie' | 'full_vip',
  method: string,
  userBalance: number
) => {
  try {
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ packageType, method, userBalance }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, error: 'Сүлжээний алдаа гарлаа' };
  }
};

export const getAiRecommendation = async (prompt: string, currentMovies: Movie[]) => {
  try {
    const response = await fetch('/api/ai/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, currentMovies }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error calling AI recommendation API:', error);
    return { error: 'Сүлжээний алдаа гарлаа' };
  }
};
