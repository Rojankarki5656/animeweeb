// hooks/useLatestEpisodes.js
import { useState, useEffect } from 'react';

export function useLatestEpisodes(page, per_page) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        console.log(`Fetching latest episodes for page ${page} with ${per_page} per page...`);
        const res = await fetch(`http://localhost:5001/api/recent-anime?page=${page || 1}&per_page=${per_page || 20}`);
        console.log('Fetching latest episodes from API...', res);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.ok) throw new Error('API returned error');
        
        // Transform to match MainLayout expected format
        const transformed = json.data.map(item => ({
          id: item.id, // or item.id – use slug for routing 
          title: item.title,
          poster: item.poster,
          episodes: {
            sub: item.is_sub || 0,
            dub: item.is_dub || 0,
            eps: item.episodes ? parseInt(item.episodes) : 0,
          },
          type: item.terms_by_type?.type?.[0] || 'TV',
          rating: item.score,
          session: null, // not needed for MainLayout
        }));
        setData(transformed);
        console.log('Fetched latest episodes:', transformed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, [page, per_page]);

  return { data, loading, error };
}