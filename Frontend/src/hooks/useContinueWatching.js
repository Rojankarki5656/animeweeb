// hooks/useContinueWatching.js
import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'animeweebs_continue_watching';

const getStoredData = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveData = (data) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

export const useContinueWatching = () => {
  const [items, setItems] = useState([]);

  // Load on mount
  useEffect(() => {
    setItems(getStoredData());
  }, []);

  // Add or update an entry (most recent first)
  const addOrUpdate = useCallback((newItem) => {
    setItems((prev) => {
      const filtered = prev.filter(item => item.id !== newItem.id);
      const updated = [newItem, ...filtered];
      saveData(updated);
      return updated;
    });
  }, []);

  // Remove a single entry
  const remove = useCallback((id) => {
    setItems((prev) => {
      const filtered = prev.filter(item => item.id !== id);
      saveData(filtered);
      return filtered;
    });
  }, []);

  // Clear everything
  const clearAll = useCallback(() => {
    setItems([]);
    saveData([]);
  }, []);

  // Export as downloadable JSON
  const exportData = useCallback(() => {
    const data = getStoredData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `continue_watching_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  // Import from JSON string (merge or replace)
  const importData = useCallback((jsonString, merge = true) => {
    try {
      const imported = JSON.parse(jsonString);
      if (!Array.isArray(imported)) throw new Error('Invalid format');
      const valid = imported.filter(item => item.id); // must have an id
      if (merge) {
        // Merge: existing items with same id get replaced
        const existing = getStoredData();
        const merged = [...existing];
        valid.forEach(imp => {
          const idx = merged.findIndex(ex => ex.id === imp.id);
          if (idx !== -1) merged[idx] = imp;
          else merged.push(imp);
        });
        merged.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        saveData(merged);
        setItems(merged);
      } else {
        saveData(valid);
        setItems(valid);
      }
      return true;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  }, []);

  return { items, addOrUpdate, remove, clearAll, exportData, importData };
};