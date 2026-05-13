import { useState, useEffect } from "react";

const BASE_URL = import.meta.env.VITE_BASE_URL;

export function useLatestEpisodes(page, per_page) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("BASE_URL:", BASE_URL);

        const res = await fetch(
          `${BASE_URL}/api/recent-anime?page=${page || 1}&per_page=${per_page || 20}`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        if (!json.ok) throw new Error("API returned error");

        const transformed = json.data.map((item) => ({
          id: item.id,
          title: item.title,
          poster: item.poster,
          episodes: {
            sub: item.is_sub || 0,
            dub: item.is_dub || 0,
            eps: item.episodes ? parseInt(item.episodes) : 0,
          },
          type: item.terms_by_type?.type?.[0] || "TV",
          rating: item.score,
          session: null,
        }));

        setData(transformed);
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