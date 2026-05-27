import { writeFileSync } from 'fs';
import { resolve } from 'path';
import { genres } from '../src/utils/genres.js';

const SITE_URL = 'https://animeweebs.app';
const API_URL = process.env.VITE_APP_LOCALURL;

const STATIC_ROUTES = [
  '/',
  '/home',
  '/search',
  '/trending',
  '/popular',
  '/latest-episodes',
  '/animes/top-airing',
  '/animes/most-popular',
  '/animes/most-favorite',
  '/animes/completed',
  '/animes/recently-added',
  '/animes/recently-updated',
  '/animes/top-upcoming',
  '/animes/subbed-anime',
  '/animes/dubbed-anime',
  '/animes/movie',
  '/animes/tv',
  '/animes/ova',
  '/animes/ona',
  '/animes/special',
  '/animes/az-list',
  '/animes/az-list/other',
  '/animes/az-list/0-9',
  '/animes/genre',
  '/animes/producer',
];

const AZ_ROUTES = Array.from('ABCDEFGHIJKLMNOPQRSTUVWXYZ', (letter) => `/animes/az-list/${letter}`);
const GENRE_ROUTES = genres.map((genre) => `/animes/genre/${encodeURIComponent(genre)}`);

async function fetchAnimeIds() {
  if (!API_URL) {
    return [];
  }

  try {
    const res = await fetch(`${API_URL}/home`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const spotlight = json?.data?.spotlight || [];
    const trending = json?.data?.trending || [];
    const topAiring = json?.data?.topAiring || [];
    const all = [...spotlight, ...trending, ...topAiring];
    const ids = [...new Set(all.map(a => a.id).filter(Boolean))];
    console.log(`✅ Fetched ${ids.length} anime IDs`);
    return ids;
  } catch (err) {
    console.error('❌ Failed to fetch anime IDs:', err.message);
    return [];
  }
}

async function generateSitemap() {
  const animeIds = await fetchAnimeIds();
  const staticUrls = STATIC_ROUTES.map((route) => `${SITE_URL}${route}`.replace(/\/$/, ''));
  const azUrls = AZ_ROUTES.map((route) => `${SITE_URL}${route}`);
  const genreUrls = GENRE_ROUTES.map((route) => `${SITE_URL}${route}`);
  const animeUrls = animeIds.map(id => `${SITE_URL}/anime/${id}`);
  const urls = [...new Set([...staticUrls, ...azUrls, ...genreUrls, ...animeUrls])];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url><loc>${url}</loc><changefreq>daily</changefreq><priority>0.8</priority></url>`).join('\n')}
</urlset>`;

  const outPath = resolve(process.cwd(), 'public/sitemap.xml');
  writeFileSync(outPath, sitemap);
  console.log(`✅ Sitemap generated with ${urls.length} URLs at ${outPath}`);
}

generateSitemap();