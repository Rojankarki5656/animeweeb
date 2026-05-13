// pages/Root.jsx
import { Search, PlayCircle, ArrowRightCircle, TrendingUp, Star, Film } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
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

  const getBestTitle = (title) => title.romaji || title.english || title.native;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navbar */}
      <div className="flex justify-between items-center px-4 md:px-8 py-4">
        <Logo />
        <div className="flex items-center gap-6">
          <Navbar />
          <button className="bg-primary hover:bg-primary/90 text-black px-4 py-2 rounded-lg font-medium transition">
            Sign In
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative min-h-[calc(100vh-80px)] px-4 md:px-8 py-6 overflow-hidden">
        {/* Background gradient only – no heavy image */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1578632767115-351597cf47d7?q=80&w=2070')] bg-cover bg-center opacity-10" />

        <div className="relative z-10 pt-10 pb-16">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-10"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4">
              Discover Your Next <span className="text-primary">Anime</span>{" "}
              Obsession
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Explore thousands of anime series, movies, and exclusive content
            </p>
          </motion.div>

          {/* Search Bar */}
          <div className="max-w-3xl mx-auto mb-12">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col md:flex-row gap-4"
            >
              <div className="relative flex-1">
                <input
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  type="text"
                  placeholder="Search anime by title..."
                  className="w-full px-5 py-4 bg-white text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
              </div>
              <button
                type="submit"
                className="bg-primary text-black font-bold px-6 py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary/90 transition"
              >
                <Search size={18} />
                Search
              </button>
            </form>
          </div>

          {/* Features + Quick Stats */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12 mb-12 md:mb-16">
            <div className="text-white max-w-md bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                <PlayCircle className="text-primary text-2xl" />
                Why AnimeWeebs?
              </h2>
              <ul className="space-y-4">
                <li>✓ 10,000+ anime titles</li>
                <li>✓ HD streaming quality</li>
                <li>✓ No ads experience</li>
                <li>✓ Fast updates</li>
              </ul>
            </div>

            {/* Trending Preview */}
            <div className="max-w-md bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 md:p-8 w-full">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-primary" />
                <h2 className="text-xl font-bold">Trending Now</h2>
              </div>
              {loading ? (
                <div className="flex justify-center py-6">
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {trending.slice(0, 5).map((anime, idx) => (
                    <Link
                      key={anime.id}
                      to={`/anime/${anime.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800/50 transition group"
                    >
                      <img
                        src={anime.coverImage?.medium}
                        alt={getBestTitle(anime.title)}
                        className="w-10 h-14 object-cover rounded-md"
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
          </div>

          {/* CTA */}
          <div className="flex justify-center mt-12">
            <Link
              to="/home"
              className="bg-primary text-black font-bold px-8 py-4 rounded-xl flex items-center gap-3 hover:bg-primary/90 transition"
            >
              Start Exploring
              <ArrowRightCircle />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Root;