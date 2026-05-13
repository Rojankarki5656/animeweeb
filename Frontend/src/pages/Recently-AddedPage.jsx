// pages/RecentlyUpdates.jsx
import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Film,
  Star,
} from "lucide-react";
import Loader from "../components/Loader";
import { useLatestEpisodes } from "../hooks/latestEpisodes";
import notify from "../utils/Toast";
import Footer from "../components/Footer";

const ANILIST_API = "https://graphql.anilist.co";

const getBestTitle = (title) => title.romaji || title.english || title.native;

const getAnilistQuery = (endpoint, page, perPage = 20) => {
  let sort = "POPULARITY_DESC";
  let statusFilter = "";
  let scoreSort = false;

  switch (endpoint) {
    case "top-upcoming":
      statusFilter = ", status: NOT_YET_RELEASED";
      break;
    case "all-time-popular":
      sort = "POPULARITY_DESC";
      break;
    case "top-100":
      sort = "SCORE_DESC";
      scoreSort = true;
      break;
    default:
      return null;
  }

  return `
    query ($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          currentPage
          hasNextPage
          total
        }
        media(sort: ${sort}, type: ANIME${statusFilter}) {
          id
          title { romaji english native }
          coverImage { large medium }
          format
          episodes
          averageScore
          status
          startDate { year }
          ${scoreSort ? "averageScore" : ""}
        }
      }
    }
  `;
};

const fetchAnilistPage = async (endpoint, page) => {
  const query = getAnilistQuery(endpoint, page);
  if (!query) return null;
  const res = await fetch(ANILIST_API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { page, perPage: 20 } }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(json.errors[0].message);
  return json.data.Page;
};

const RecentlyUpdates = () => {
  const { id: endpoint } = useParams();
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [pageInfo, setPageInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isLatestEpisodes =
    endpoint === "recently-updates" || endpoint === "recent-anime";
  const isAnilistSection = [
    "top-upcoming",
    "all-time-popular",
    "top-100",
  ].includes(endpoint);

  // Hook for latest episodes (returns full array)
  const {
    data: latestData,
    loading: latestLoading,
    error: latestError,
  } = useLatestEpisodes(page, 20);

  // For latest episodes: apply local pagination

  useEffect(() => {
    if (!isLatestEpisodes || latestLoading) return;

    if (latestError) {
      setError(latestError);
      setLoading(false);
      return;
    }

    // If your hook returns { episodes, pageInfo }
    const episodeList =
      latestData?.episodes || latestData?.data || latestData || [];
    const apiPageInfo = latestData?.pageInfo;

    setItems(episodeList);

    if (apiPageInfo) {
      setPageInfo({
        currentPage: apiPageInfo.currentPage,
        hasNextPage: apiPageInfo.hasNextPage,
        total: apiPageInfo.total,
        lastPage: apiPageInfo.lastPage || Math.ceil(apiPageInfo.total / 20),
      });
    } else {
      // Fallback if no metadata is available
      setPageInfo({
        currentPage: page,
        hasNextPage: episodeList.length === 20,
        total: page * 20 + (episodeList.length === 20 ? 20 : 0),
        lastPage: page + (episodeList.length === 20 ? 1 : 0),
      });
    }

    setLoading(false);
  }, [isLatestEpisodes, latestData, latestLoading, latestError, page]);

  // For AniList sections
  useEffect(() => {
    if (isAnilistSection) {
      const loadAnilist = async () => {
        setLoading(true);
        try {
          const pageData = await fetchAnilistPage(endpoint, page);
          setItems(pageData.media || []);
          setPageInfo(pageData.pageInfo);
        } catch (err) {
          setError(err.message);
          notify("error", err.message);
        } finally {
          setLoading(false);
        }
      };
      loadAnilist();
    }
  }, [isAnilistSection, endpoint, page]);

  if (
    (isLatestEpisodes && latestLoading) ||
    (isAnilistSection && loading && !items.length)
  ) {
    return <Loader className="h-screen" />;
  }

  if (error || latestError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-red-500">{error || latestError}</p>
      </div>
    );
  }

  const pageTitle =
    {
      "recently-updates": "Recently Updated Anime",
      "recent-anime": "Recently Updated Anime",
      "top-upcoming": "Top Upcoming Anime",
      "all-time-popular": "All Time Popular Anime",
      "top-100": "Top 100 Anime",
    }[endpoint] || "Anime List";

  const pageDescription = `Watch ${pageTitle.toLowerCase()} online free on AnimeWeebs. No ads, HD streaming.`;

  const buildWatchPath = (item) => {
    // For latest episodes (from Anikoto) – use numeric ID
    if (isLatestEpisodes) {
      // Use episodes.eps or episodes.sub to get latest episode number (if needed)
      const epNum = item.episodes?.eps || item.episodes?.sub || 1;
      return `/watch/${item.id}?ep=${epNum}`;
    }
    // For AniList items – link to detail page (no direct episode)
    return `/anime/${item.id}`;
  };

  const renderCard = (item, idx) => {
    const isAnilistItem = !isLatestEpisodes; // if not latest, it's from AniList
    const title = isAnilistItem ? getBestTitle(item.title) : item.title;
    const image = isAnilistItem
      ? item.coverImage?.large || item.coverImage?.medium
      : item.poster;

    let episodeInfo;
    if (isAnilistItem) {
      episodeInfo = (
        <div className="flex items-center justify-between mt-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Film className="w-3 h-3" />
            {item.format || "TV"}
          </span>
          {item.averageScore && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" />
              {item.averageScore / 10}
            </span>
          )}
        </div>
      );
    } else {
      // Latest episodes info
      const eps = item.episodes || {};
      episodeInfo = (
        <>
          <div className="flex flex-wrap gap-2 mb-3">
            {eps.sub > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                SUB {eps.sub}
              </span>
            )}
            {eps.dub > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400">
                DUB {eps.dub}
              </span>
            )}
            {eps.eps > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/10 text-green-400">
                EPS {eps.eps}
              </span>
            )}
          </div>
          <div className="text-xs text-gray-400">Watch now</div>
        </>
      );
    }

    return (
      <Link
        key={item.id}
        to={buildWatchPath(item)}
        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-950/80 backdrop-blur-sm border border-gray-800 hover:border-orange-500/50 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10"
      >
        {idx < 3 && (
          <div className="absolute top-3 left-3 z-10">
            <div className="px-2 py-1 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 text-xs font-bold text-white shadow-lg flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />#{idx + 1}
            </div>
          </div>
        )}

        <div className="relative aspect-[2/3] overflow-hidden rounded-t-2xl">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-orange-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        <div className="p-4">
          <h2 className="text-sm md:text-base font-bold text-white truncate mb-2 group-hover:text-orange-300 transition-colors">
            {title}
          </h2>
          {episodeInfo}
        </div>

        <div className="absolute inset-x-0 bottom-0 h-0 group-hover:h-12 overflow-hidden transition-all duration-300">
          <div className="bg-gradient-to-r from-orange-600/90 to-pink-600/90 backdrop-blur-sm flex items-center justify-center h-full">
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <span>Watch Now</span>
              <ChevronRight className="w-4 h-4" />
            </span>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <Helmet>
        <title>{pageTitle} | AnimeWeebs – Free Anime Streaming</title>
        <meta name="description" content={pageDescription} />
        <link
          rel="canonical"
          href={`https://animeweebs.app/list/${endpoint}`}
        />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Helmet>

      <div className="max-w-7xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            {pageTitle}
          </h1>
          <p className="text-gray-300 text-lg">{pageDescription}</p>
        </div>

        {items.length === 0 && !loading ? (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No items found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
            {items.map((item, idx) => renderCard(item, idx))}
          </div>
        )}

        {pageInfo && pageInfo.total > 0 && (
          <div className="flex justify-center items-center gap-6 mt-12">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={pageInfo.currentPage === 1}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
                pageInfo.currentPage === 1
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <span className="text-white bg-gray-800 px-4 py-2 rounded-full text-sm">
              Page {pageInfo.currentPage} of {pageInfo.lastPage}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!pageInfo.hasNextPage}
              className={`flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all ${
                !pageInfo.hasNextPage
                  ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                  : "bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
              }`}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
};

export default RecentlyUpdates;
