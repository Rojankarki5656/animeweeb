// pages/SearchResult.jsx
import { useState, useEffect, useCallback } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Loader2, Film, Star, ChevronRight, ChevronLeft } from "lucide-react";
import Heading from "../components/Heading";
import Footer from "../components/Footer";

const ANILIST_API = "https://graphql.anilist.co";

const SEARCH_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
        total
      }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
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
        episodes
        averageScore
        status
        startDate {
          year
        }
      }
    }
  }
`;

const SearchResult = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || ""; // using 'q' param for consistency

  const [results, setResults] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const fetchResults = useCallback(async (page) => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ANILIST_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: {
            search: query,
            page: page,
            perPage: 20,
          },
        }),
      });
      const json = await res.json();
      if (json.errors) throw new Error(json.errors[0].message);
      const data = json.data.Page;
      setResults(data.media || []);
      setPageInfo(data.pageInfo);
    } catch (err) {
      setError(err.message);
      setResults([]);
      setPageInfo(null);
    } finally {
      setLoading(false);
      setIsFirstLoad(false);
    }
  }, [query]);

  // Initial fetch when query changes
  useEffect(() => {
    if (query) {
      setCurrentPage(1);
      fetchResults(1);
    } else {
      setResults([]);
      setPageInfo(null);
    }
  }, [query, fetchResults]);

  const changePage = (newPage) => {
    if (newPage >= 1 && pageInfo?.hasNextPage) {
      setCurrentPage(newPage);
      fetchResults(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const getBestTitle = (title) => title.romaji || title.english || title.native;

  if (isFirstLoad && loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center px-4">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => fetchResults(1)}
          className="px-4 py-2 bg-primary text-black rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!loading && results.length === 0 && query) {
    return (
      <div className="flex flex-col justify-center items-center h-screen text-center">
        <h2 className="text-2xl font-bold mb-2">No results found for "{query}"</h2>
        <p className="text-gray-400">Try a different keyword or check the spelling</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 pb-12">
      <Helmet>
        <title>{query ? `Search: ${query} · AnimeWeebs` : "Search Results"}</title>
        <meta name="description" content={`Search results for "${query}" – find your next favorite anime.`} />
      </Helmet>

      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center gap-4 mb-8">
          <Heading>Search results for "{query}"</Heading>
          {pageInfo && (
            <span className="text-sm text-gray-400">
              ({pageInfo.total} results)
            </span>
          )}
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {results.map((anime) => (
            <Link
              key={anime.id}
              to={`/anime/${anime.id}`}
              className="group relative overflow-hidden rounded-2xl bg-gray-900/80 border border-gray-800 hover:border-indigo-500 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10"
            >
              <div className="relative aspect-[2/3] overflow-hidden">
                <img
                  src={anime.coverImage?.large || anime.coverImage?.medium}
                  alt={getBestTitle(anime.title)}
                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="p-3">
                <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-300 transition">
                  {getBestTitle(anime.title)}
                </h3>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Film className="w-3 h-3" />
                    {anime.format || "TV"}
                  </span>
                  {anime.averageScore && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400" />
                      {anime.averageScore / 10}
                    </span>
                  )}
                </div>
                {anime.episodes && (
                  <p className="text-xs text-gray-500 mt-1">{anime.episodes} eps</p>
                )}
                {anime.startDate?.year && (
                  <p className="text-xs text-gray-500">{anime.startDate.year}</p>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Pagination */}
        {pageInfo && pageInfo.total > 0 && (
          <div className="flex justify-center items-center gap-4 mt-10">
            <button
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                currentPage === 1
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-indigo-600"
              }`}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <span className="text-gray-300">
              Page {currentPage} of {pageInfo.lastPage}
            </span>
            <button
              onClick={() => changePage(currentPage + 1)}
              disabled={!pageInfo?.hasNextPage}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition ${
                !pageInfo?.hasNextPage
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-gray-800 text-white hover:bg-indigo-600"
              }`}
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default SearchResult;