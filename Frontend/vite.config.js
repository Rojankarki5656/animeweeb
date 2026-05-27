import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteSitemap from "vite-plugin-sitemap";
import { genres } from "./src/utils/genres.js";

// Use environment variable for API URL (fallback to localhost)
const API_URL = process.env.VITE_APP_LOCALURL || process.env.VITE_API_URL || "http://localhost:5000";

const STATIC_ROUTES = [
  "/",
  "/home",
  "/search",
  "/trending",
  "/popular",
  "/latest-episodes",
  "/animes/top-airing",
  "/animes/most-popular",
  "/animes/most-favorite",
  "/animes/completed",
  "/animes/recently-added",
  "/animes/recently-updated",
  "/animes/top-upcoming",
  "/animes/subbed-anime",
  "/animes/dubbed-anime",
  "/animes/movie",
  "/animes/tv",
  "/animes/ova",
  "/animes/ona",
  "/animes/special",
  "/animes/az-list",
  "/animes/az-list/other",
  "/animes/az-list/0-9",
  "/animes/genre",
  "/animes/producer",
];

const AZ_ROUTES = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ", (letter) => `/animes/az-list/${letter}`);
const GENRE_ROUTES = genres.map((genre) => `/animes/genre/${encodeURIComponent(genre)}`);

export default defineConfig({
  plugins: [
    react(),
    viteSitemap({
      hostname: "https://animeweebs.app",
      // Dynamically fetch anime IDs – but note: runs at build time
      async routes() {
        if (!API_URL) {
          return [...STATIC_ROUTES, ...AZ_ROUTES, ...GENRE_ROUTES];
        }

        try {
          const response = await fetch(`${API_URL}/home`);
          if (!response.ok) throw new Error(`API responded with ${response.status}`);
          const data = await response.json();
          const spotlight = data?.data?.spotlight || [];
          const trending = data?.data?.trending || [];
          const topAiring = data?.data?.topAiring || [];
          const animeIds = [...new Set([...spotlight, ...trending, ...topAiring].map((item) => item.id).filter(Boolean))];
          const animeRoutes = animeIds.map((id) => `/anime/${id}`);
          return [...new Set([...STATIC_ROUTES, ...AZ_ROUTES, ...GENRE_ROUTES, ...animeRoutes])];
        } catch (err) {
          console.warn("⚠️ Could not fetch anime IDs for sitemap, using fallback.");
          return [...STATIC_ROUTES, ...AZ_ROUTES, ...GENRE_ROUTES];
        }
      },
      outDir: "dist",
    }),
  ],
});