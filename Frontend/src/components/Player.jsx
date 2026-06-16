import { useRef, useState, useEffect } from "react";
import { Loader2, AlertCircle, Download, SkipBack, SkipForward } from "lucide-react";

const Player = ({
  episodeNumber,
  animeTitle,
  sources = [],
  downloads = [],
  isLoading,
  isError,
  isTheater = false,
  preferredLanguage = "sub",
  resumeTime = 0,
}) => {
  const iframeRef = useRef(null);
  const [selectedSourceIndex, setSelectedSourceIndex] = useState(0);

  // ----- Auto-select source based on preferredLanguage -----
  useEffect(() => {
    if (!sources.length) return;
    // Find indices of SUB and DUB
    const subIdx = sources.findIndex(s => s.label === "SUB");
    const dubIdx = sources.findIndex(s => s.label === "DUB");
    let targetIdx = 0;
    if (preferredLanguage === "dub" && dubIdx !== -1) {
      targetIdx = dubIdx;
    } else if (preferredLanguage === "sub" && subIdx !== -1) {
      targetIdx = subIdx;
    }
    setSelectedSourceIndex(targetIdx);
  }, [sources, preferredLanguage]);

  // Handle manual change from <select>
  const handleSourceChange = (e) => {
    const idx = Number(e.target.value);
    setSelectedSourceIndex(idx);
    // Notify parent about language change
    if (onLanguageChange) {
      const newLang = sources[idx]?.label === "DUB" ? "dub" : "sub";
      if (newLang !== preferredLanguage) {
        onLanguageChange(newLang);
      }
    }
  };

  const currentSource = sources[selectedSourceIndex];
  const embedUrl = currentSource?.file;

  if (isLoading) {
    return (
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (isError || !sources.length || !embedUrl) {
    return (
      <div className="aspect-video bg-black rounded-xl flex flex-col items-center justify-center text-red-400">
        <AlertCircle className="w-12 h-12 mb-2" />
        <p>{isError ? "Failed to load video" : "No video source available"}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-primary text-black rounded-lg"
        >
          Retry
        </button>
      </div>
    );
  }

  const isHls = embedUrl.includes(".m3u8");

  return (
    <div className={`relative aspect-video bg-black rounded-xl overflow-hidden group ${isTheater ? "rounded-none" : ""}`}>
      {isHls ? (
        <video src={embedUrl} controls className="w-full h-full" poster="" />
      ) : (
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen"
          frameBorder="0"
          scrolling="no"
          title={`${animeTitle} Episode ${episodeNumber}`}
        />
      )}

      {/* Overlay controls */}
      <div className="absolute top-2 right-2 z-10 flex gap-2">
        {/* Downloads (if any) */}
        {downloads.length > 0 && (
          <div className="relative group/download">
            <button className="bg-black/70 p-1 rounded hover:bg-black/90">
              <Download className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-gray-800 rounded shadow-lg p-2 hidden group-hover/download:block z-20">
              {downloads.map((d, idx) => (
                <a
                  key={idx}
                  href={d.download}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs px-3 py-1 hover:bg-gray-700 whitespace-nowrap"
                >
                  {d.quality} {d.isDub ? "(Dub)" : ""}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Player;