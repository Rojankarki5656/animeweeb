// components/Header.jsx
import { useRef, useState, useEffect, useCallback } from "react";
import { Search, Menu, X, Loader2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import useSidebarStore from "../store/sidebarStore";
import Logo from "./Logo";
import debounce from "lodash/debounce";

const ANILIST_API = "https://graphql.anilist.co";

const SUGGESTION_QUERY = `
  query ($search: String) {
    Page(page: 1, perPage: 8) {
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
          native
        }
        coverImage {
          medium
          large
        }
        format
        averageScore
        status
        episodes
        startDate { year }
      }
    }
  }
`;

const Header = () => {
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Debounced search function
  const fetchSuggestions = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(ANILIST_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: SUGGESTION_QUERY,
            variables: { search: searchTerm },
          }),
        });
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        const media = json.data?.Page?.media || [];
        setSuggestions(media);
      } catch (err) {
        console.error("Suggestion error:", err);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setValue(newValue);
    setSelectedIndex(-1);
    fetchSuggestions(newValue);
  };

  const resetSearch = () => {
    setValue("");
    setSuggestions([]);
    setSelectedIndex(-1);
    setIsMobileOpen(false);
    fetchSuggestions.cancel();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) {
      navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      resetSearch();
    }
  };

  const navigateToAnime = (id) => {
    navigate(`/anime/${id}`);
    resetSearch();
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      navigateToAnime(suggestions[selectedIndex].id);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSuggestions([]);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getBestTitle = (title) => title.romaji || title.english || title.native;

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/95 via-black/80 to-transparent backdrop-blur-xl border-b border-gray-800/50">
      <div className="px-4 md:px-8 py-3 flex items-center justify-between gap-4">
        {/* Left - Logo & Menu */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="text-white hover:text-blue-400 p-2 rounded-lg hover:bg-gray-800/50 transition"
          >
            <Menu size={22} />
          </button>
          <Logo />
        </div>

        {/* Desktop Search */}
        <div ref={searchRef} className="hidden md:block flex-1 max-w-xl relative">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Search anime by title, genre, or character..."
              className="w-full bg-gray-900/80 text-white pl-12 pr-10 py-3 rounded-xl border border-gray-700/50 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition"
            />
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            {value && (
              <button
                type="button"
                onClick={resetSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
              >
                <X size={18} />
              </button>
            )}
          </form>

          {/* Suggestions Dropdown */}
          {(value.length >= 2) && (suggestions.length > 0 || isLoading) && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-800/50 shadow-2xl overflow-hidden z-50">
              {isLoading ? (
                <div className="flex justify-center py-6">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
                </div>
              ) : (
                <>
                  <div className="px-4 py-2 border-b border-gray-800/50 text-xs text-gray-400">
                    Suggestions
                  </div>
                  {suggestions.map((anime, idx) => (
                    <div
                      key={anime.id}
                      onClick={() => navigateToAnime(anime.id)}
                      className={`flex gap-3 px-4 py-3 hover:bg-gray-800/70 cursor-pointer transition ${
                        idx === selectedIndex ? "bg-gray-800/70" : ""
                      }`}
                    >
                      <img
                        src={anime.coverImage?.medium || anime.coverImage?.large}
                        alt={getBestTitle(anime.title)}
                        className="w-12 h-16 object-cover rounded-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white">{getBestTitle(anime.title)}</div>
                        {anime.title?.english && anime.title.english !== getBestTitle(anime.title) && (
                          <div className="text-xs text-gray-400 truncate">{anime.title.english}</div>
                        )}
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-300">
                          <span className="bg-gray-800 px-1.5 py-0.5 rounded">
                            {anime.format || "TV"}
                          </span>
                          {anime.averageScore && (
                            <span className="bg-blue-900/30 px-1.5 py-0.5 rounded text-blue-300">
                              {anime.averageScore / 10}
                            </span>
                          )}
                          {anime.episodes && <span>{anime.episodes} eps</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="p-2 border-t border-gray-800/50">
                    <button
                      onClick={handleSubmit}
                      className="w-full py-2 text-center text-sm bg-gray-800/50 hover:bg-gray-700 text-gray-300 rounded-lg transition flex items-center justify-center gap-2"
                    >
                      <Search size={16} />
                      View all results for "{value}"
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Mobile Search Toggle */}
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="md:hidden text-white hover:text-blue-400 p-2 rounded-lg hover:bg-gray-800/50 transition"
        >
          {isMobileOpen ? <X size={24} /> : <Search size={22} />}
        </button>
      </div>

      {/* Mobile Search Panel */}
      {isMobileOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-gray-800/50 p-4">
          <form onSubmit={handleSubmit} className="relative">
            <input
              value={value}
              onChange={handleInputChange}
              placeholder="Search anime..."
              className="w-full bg-gray-900/80 text-white pl-12 pr-10 py-3 rounded-xl border border-gray-700/50 focus:outline-none focus:border-blue-500/50"
            />
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            {value && (
              <button
                type="button"
                onClick={resetSearch}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                <X size={18} />
              </button>
            )}
          </form>
          {/* Optional: show suggestions in mobile – you can reuse the same list */}
          {(value.length >= 2 && suggestions.length > 0) && (
            <div className="mt-2 bg-gray-900 rounded-xl overflow-hidden">
              {suggestions.slice(0, 5).map((anime) => (
                <div
                  key={anime.id}
                  onClick={() => navigateToAnime(anime.id)}
                  className="flex gap-3 p-3 border-b border-gray-800 last:border-0 hover:bg-gray-800/70"
                >
                  <img
                    src={anime.coverImage?.medium}
                    className="w-10 h-14 object-cover rounded"
                    alt=""
                  />
                  <div>
                    <div className="text-white text-sm">{getBestTitle(anime.title)}</div>
                    <div className="text-xs text-gray-400">{anime.format}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Header;