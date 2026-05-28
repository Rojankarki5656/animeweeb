// pages/Root.jsx
import { Search, PlayCircle, ArrowRightCircle, TrendingUp, Star, Film, Shuffle, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";  // Install: npm i react-helmet-async
import Navbar from "../components/Navbar";
import Logo from "../components/Logo";

const ANILIST_API = "https://graphql.anilist.co";

const TRENDING_QUERY = `
  query {
    Page(page: 1, perPage: 12) {
      media(sort: TRENDING_DESC, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          large
          medium
        }
        format
        averageScore
      }
    }
  }
`;

const Root = () => {
  const [searchValue, setSearchValue] = useState("");
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [randomAnime, setRandomAnime] = useState(null);
  const navigate = useNavigate();

  // Fetch trending anime on mount
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const res = await fetch(ANILIST_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: TRENDING_QUERY }),
        });
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        setTrending(json.data.Page.media || []);
      } catch (err) {
        console.error("Failed to fetch trending:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  };

  const getRandomAnime = () => {
    if (trending.length === 0) return;
    const randomIndex = Math.floor(Math.random() * trending.length);
    setRandomAnime(trending[randomIndex]);
  };

  const getBestTitle = (title) => title.romaji || title.english || title.native;

  // JSON-LD structured data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "AnimeWeebs",
    "url": "https://animeweebs.app",
    "description": "AnimeWeebs is the #1 platform for anime fans to discover new series, track progress, and connect with fellow weebs.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://animeweebs.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "AnimeWeebs",
    "url": "https://animeweebs.app",
    "logo": "https://animeweebs.app/logo.png", // replace with actual logo URL
    "sameAs": [
      "https://twitter.com/animeweebs",
      "https://discord.gg/animeweebs"
    ]
  };

  return (
    <>
      <Helmet>
        {/* Primary SEO */}
        <title>AnimeWeebs – Discover, Track & Discuss Anime | #1 Anime Community</title>
        <meta name="description" content="AnimeWeebs is the ultimate hub for anime fans. Discover 10,000+ anime, track your watchlist, join discussions, and connect with fellow weebs. Free and ad‑free." />
        <meta name="keywords" content="animeweebs, anime weeb, anime community, discover anime, anime tracker, anime discussion" />
        <link rel="canonical" href="https://animeweebs.app/" />
        <meta name="robots" content="index, follow" />

        {/* Open Graph / Social */}
        <meta property="og:title" content="AnimeWeebs – Your Anime Home" />
        <meta property="og:description" content="Join the fastest‑growing anime community. Discover new shows, rate episodes, and talk with thousands of weebs." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://animeweebs.app/" />
        <meta property="og:image" content="https://animeweebs.app/og-image.jpg" /> {/* create one */}
        <meta property="og:site_name" content="AnimeWeebs" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AnimeWeebs – Discover Anime with Fellow Weebs" />
        <meta name="twitter:description" content="Free anime discovery, tracking, and community. Join now!" />
        <meta name="twitter:image" content="https://animeweebs.app/twitter-image.jpg" />

        {/* JSON-LD */}
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
      </Helmet>

      <div className="min-h-screen bg-black text-white">
        {/* Navbar */}
        <div className="flex justify-between items-center px-4 md:px-8 py-4">
          <Link to="/" aria-label="AnimeWeebs Home">
            <Logo />
          </Link>
          <div className="flex items-center gap-6">
            <Navbar />
            <button className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg font-medium transition">
              Sign In
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="relative min-h-[calc(100vh-80px)] px-4 md:px-8 py-6 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578632767115-351597cf47d7?q=80&w=2070')] bg-cover bg-center opacity-10" />

          <div className="relative z-10 pt-10 pb-16">
            {/* Keyword‑rich H1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
                Welcome to <span className="text-primary">AnimeWeebs</span> – 
                The Ultimate Hub for Anime Fans
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mx-auto">
                AnimeWeebs helps you discover, track, and discuss thousands of anime. 
                Join a community of passionate weebs who call this home.
              </p>
            </motion.div>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto mb-12">
              <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <input
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    type="text"
                    placeholder="Search anime by title... (e.g., Naruto, One Piece)"
                    className="w-full px-5 py-4 bg-white text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Search anime"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
                <button
                  type="submit"
                  className="bg-primary text-black font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition"
                >
                  <Search size={18} />
                  Search Anime
                </button>
              </form>
            </div>

            {/* Features + Trending + Random Anime + Discord */}
            <div className="flex flex-col lg:flex-row justify-center gap-8 md:gap-12 mb-12 md:mb-16">
              {/* Why AnimeWeebs */}
              <div className="text-white max-w-md bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                  <PlayCircle className="text-primary" />
                  Why AnimeWeebs?
                </h2>
                <ul className="space-y-4">
                  <li>✓ <strong>10,000+ anime titles</strong> – complete database</li>
                  <li>✓ <strong>Personal watchlist</strong> – track what you’ve seen</li>
                  <li>✓ <strong>Ad‑free experience</strong> – no interruptions</li>
                  <li>✓ <strong>Daily updates</strong> – new episodes & series</li>
                  <li>✓ <strong>Active Discord community</strong> – chat with weebs worldwide</li>
                </ul>
              </div>

              {/* Trending Preview */}
              <div className="max-w-md bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 md:p-8 w-full">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="text-primary" />
                  <h2 className="text-xl font-bold">Trending Now on AnimeWeebs</h2>
                </div>
                {loading ? (
                  <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trending.slice(0, 5).map((anime) => (
                      <Link
                        key={anime.id}
                        to={`/anime/${anime.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition group"
                      >
                        <img
                          src={anime.coverImage?.medium}
                          alt={getBestTitle(anime.title)}
                          className="w-10 h-14 object-cover rounded-md"
                          loading="lazy"
                        />
                        <div className="flex-1">
                          <div className="text-sm font-medium group-hover:text-primary">
                            {getBestTitle(anime.title)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span>{anime.format}</span>
                            {anime.averageScore && (
                              <span className="flex items-center gap-1">
                                <Star size={12} className="text-yellow-400" />
                                {anime.averageScore / 10}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Random Anime Button + Discord Tease */}
              <div className="max-w-md bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 md:p-8 w-full flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-3">
                    <Shuffle className="text-primary" />
                    Feeling Lucky?
                  </h2>
                  <button
                    onClick={getRandomAnime}
                    className="w-full bg-primary/20 hover:bg-primary/30 text-primary font-medium py-2 rounded-lg transition"
                  >
                    Pick a Random Anime
                  </button>
                  {randomAnime && (
                    <Link
                      to={`/anime/${randomAnime.id}`}
                      className="mt-3 block p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700 transition"
                    >
                      <p className="text-sm">✨ {getBestTitle(randomAnime.title)}</p>
                    </Link>
                  )}
                </div>
                <div className="border-t border-gray-700 pt-4">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-2">
                    <MessageCircle className="text-primary" />
                    Join our Discord
                  </h2>
                  <p className="text-sm text-gray-300 mb-2">
                    500+ weebs chatting daily. Get recommendations, share art, and more.
                  </p>
                  <a
                    href="https://discord.gg/animeweebs" // replace with your real invite
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm transition"
                  >
                    Join Discord → 
                  </a>
                </div>
              </div>
            </div>

            {/* "What is an AnimeWeeb?" Section – Keyword‑rich content */}
            <div className="max-w-4xl mx-auto my-12 bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-center">
                What is an <span className="text-primary">AnimeWeeb</span>?
              </h2>
              <div className="text-gray-200 space-y-4 text-center md:text-left">
                <p>
                  An <strong className="text-primary">AnimeWeeb</strong> isn't just a fan – it's a lifestyle. 
                  It’s someone who lives and breathes anime culture, from binging the latest shonen 
                  to collecting rare merchandise and discussing fan theories until 3 AM.
                </p>
                <p>
                  At <strong>AnimeWeebs</strong>, we’ve built the ultimate digital dojo for weebs everywhere. 
                  Whether you're here to <Link to="/search" className="text-primary underline">discover your next obsession</Link>, 
                  <Link to="/track" className="text-primary underline ml-1">track your progress</Link>, or just 
                  <a href="https://discord.gg/animeweebs" className="text-primary underline"> chat with like-minded fans</a>, 
                  you’ve found your home.
                </p>
                <p className="italic text-gray-300">
                  “AnimeWeebs changed how I watch anime. The community is incredible!” – <em>Mia, verified weeb</em>
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center mt-8">
              <Link
                to="/home"
                className="bg-primary text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-primary/90 transition text-lg"
              >
                Start Exploring AnimeWeebs
                <ArrowRightCircle />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Root;