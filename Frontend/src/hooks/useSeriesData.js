// hooks/useSeriesData.js
import { useState, useEffect } from "react";
import { useAniListAnime } from "./animeinfo";
import { useMegaAnime } from "./animeinfofromserver";

const MEGAPLAY_BASE = process.env.MEGAPLAY_BASE;
const BASE_URL = process.env.REACT_APP_BASE_URL;

/**
 * Try primary API first, fallback to AniList + MegaPlay
 */
export const useSeriesData = (id, type) => {
  const [series, setSeries] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  // Fetch AniList detail (for fallback)
  const {
    data: anilistData,
    isLoading: anilistLoading,
    isError: anilistError,
  } = useAniListAnime(id);
  const {
    data: megaData,
    isLoading: megaLoading,
    isError: megaError,
  } = useMegaAnime(id);

  console.log("Mega id vs AniList id:", megaData?.anime?.ani_id, id);

  useEffect(() => {
    if (!id) return;
    const fetchPrimary = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/watch?id=${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (!json.ok) throw new Error("API returned error");

        const { anime, episodes: epList } = json.data;
        const sorted = [...epList].sort((a, b) => a.number - b.number);
        setSeries(anime);
        setEpisodes(sorted);
        setUsedFallback(false);
        setIsLoading(false);
        return true; // success
      } catch (err) {
        console.warn("Primary API failed, switching to fallback:", err);
        return false;
      }
    };

    const buildFallbackEpisodes = () => {
      if (!anilistData) return;
      const totalEp =
        anilistData?.airing?.nextEpisode || anilistData?.episodes || 12; // fallback 12
      const fallbackEpisodes = [];
      for (let i = 1; i <= totalEp; i++) {
        fallbackEpisodes.push({
          number: i,
          title: `Episode ${i}`,
          embed_url: {
            sub: `${MEGAPLAY_BASE}/${id}/${i}/sub`,
            dub: `${MEGAPLAY_BASE}/${id}/${i}/dub`,
          },
          updated_at: new Date().toISOString(),
        });
      }
      setEpisodes(fallbackEpisodes);
      setSeries({
        id: anilistData.id,
        title: anilistData.title,
        poster: anilistData.poster,
        duration: anilistData.episodeDuration,
        status: anilistData.status,
      });
      setUsedFallback(true);
      setIsLoading(false);
    };

    const start = async () => {
      setIsLoading(true);
      setIsError(false);

      if (type === "latest") {
        await fetchPrimary();
      } else {
        // If primary fails, wait for AniList data (if not already loaded)
        if (anilistData) {
          buildFallbackEpisodes();
        } else {
          // AniList still loading – wait for it
          const checkAnilist = setInterval(() => {
            if (anilistData) {
              clearInterval(checkAnilist);
              buildFallbackEpisodes();
            } else if (anilistError) {
              clearInterval(checkAnilist);
              setIsError(true);
              setIsLoading(false);
            }
          }, 300);
          return () => clearInterval(checkAnilist);
        }
      }
    };
    start();
  }, [id, anilistData, anilistError]);

  return { series, episodes, isLoading, isError, usedFallback };
};
