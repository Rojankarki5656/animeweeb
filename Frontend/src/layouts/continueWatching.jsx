// Home.js (or wherever you want the section)
import { useRef } from "react";
// ContinueWatchingSection.js (or wherever you placed it)
import { X } from 'lucide-react';
import { useContinueWatching } from '../hooks/useContinueWatching';
import { Link } from 'react-router-dom';

const ContinueWatchingSection = () => {
  const { items, remove, clearAll, exportData, importData } = useContinueWatching();
  const fileInputRef = useRef(null);

  if (items.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p>No anime watched yet.</p>
        <p className="text-sm">Start watching and we’ll save your progress here.</p>
      </div>
    );
  }

  const handleImport = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const success = importData(ev.target.result, true); // merge by default
      if (!success) alert('Invalid file');
    };
    reader.readAsText(file);
    e.target.value = ''; // reset input
  };

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-white">Continue Watching</h2>
        <div className="flex gap-2">
          <button
            onClick={exportData}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Export
          </button>
          <button
            onClick={() => fileInputRef.current.click()}
            className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
          >
            Import
          </button>
          <button
            onClick={clearAll}
            className="px-3 py-1 bg-red-700 hover:bg-red-600 rounded text-sm"
          >
            Clear All
          </button>
          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {items.map((item) => (
          <div key={item.id} className="relative min-w-[140px] max-w-[140px] flex-shrink-0 group">
            <Link to={`/watch/${item.id}?ep=${item.episode}`}>
              <img
                src={item.poster || '/placeholder.jpg'}
                alt={item.title}
                className="w-full h-[200px] object-cover rounded-lg"
              />
              <div className="mt-1">
                <p className="text-sm text-white truncate">{item.title}</p>
                <p className="text-xs text-gray-400">Ep {item.episode}</p>
              </div>
            </Link>
            <button
              onClick={() => remove(item.id)}
              className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
              aria-label="Remove"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ContinueWatchingSection;