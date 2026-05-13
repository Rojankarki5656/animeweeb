import useSidebarStore from "../store/sidebarStore";
import { Link, useLocation } from "react-router-dom";
import Genres from "./Genres";
import { useEffect } from "react";
import { 
  X, Home, Tv, Mic, TrendingUp, Calendar, Heart, CheckCircle, 
  PlusCircle, RefreshCw, Clock, List, Film, Box, Tv2, 
  Sparkles, ChevronRight 
} from "lucide-react";

const Sidebar = () => {
  const isSidebarOpen = useSidebarStore((state) => state.isSidebarOpen);
  const toggleSidebar = useSidebarStore((state) => state.toggleSidebar);
  const location = useLocation();
  
  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (window.innerWidth < 1024 && isSidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname]);

  // Navigation items with icons and new routes (adapting to new API structure)
  const mainLinks = [
    { name: "Home", icon: Home, path: "/home" },
    { name: "Subbed Anime", icon: Tv, path: "/list/recently-updates?type=sub" }, // adjust if needed
    { name: "Dubbed Anime", icon: Mic, path: "/list/recently-updates?type=dub" },
    { name: "Most Popular", icon: TrendingUp, path: "/list/all-time-popular" },
    { name: "Top Airing", icon: Calendar, path: "/list/top-airing" }, // not yet implemented? leave as placeholder
    { name: "Most Favorite", icon: Heart, path: "/list/most-favorite" },
    { name: "Latest Completed", icon: CheckCircle, path: "/list/completed" },
    { name: "Recently Added", icon: PlusCircle, path: "/list/recently-added" },
    { name: "Recently Updated", icon: RefreshCw, path: "/list/recently-updates" },
    { name: "Top Upcoming", icon: Clock, path: "/list/top-upcoming" },
    { name: "A-Z List", icon: List, path: "/az-list/a" },
    { name: "Movies", icon: Film, path: "/list/movies" },
    { name: "OVAs", icon: Box, path: "/list/ova" },
    { name: "ONAs", icon: Tv2, path: "/list/ona" },
    { name: "Specials", icon: Sparkles, path: "/list/special" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 lg:w-80 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800 shadow-2xl z-50 transition-transform duration-300 ease-in-out overflow-y-auto ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header with close button */}
        <div className="sticky top-0 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800 p-4 flex items-center justify-between">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            Menu
          </h2>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="py-4">
          {mainLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={toggleSidebar}
              className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-lg transition-all duration-200 ${
                isActive(item.path)
                  ? "bg-primary/10 text-primary border border-primary/30 shadow-sm"
                  : "text-gray-300 hover:bg-gray-800/50 hover:text-white"
              }`}
            >
              <item.icon size={18} className="flex-shrink-0" />
              <span className="font-medium">{item.name}</span>
              {isActive(item.path) && <ChevronRight size={16} className="ml-auto" />}
            </Link>
          ))}
        </nav>

        {/* Genres Section */}
        <div className="border-t border-gray-800 pt-4 mt-2">
          <div className="px-4 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Genres
          </div>
          <div className="px-3 pb-4">
            <Genres
              event={toggleSidebar}
              className="flex flex-wrap gap-2"
              itemClassName="px-3 py-1.5 text-sm bg-gray-800/50 hover:bg-gray-700 rounded-full transition-colors"
            />
          </div>
        </div>

        {/* Footer decoration */}
        <div className="text-center py-6 text-xs text-gray-500 border-t border-gray-800 mt-4">
          © AnimeWeebs • Free Anime Streaming
        </div>
      </aside>
    </>
  );
};

export default Sidebar;