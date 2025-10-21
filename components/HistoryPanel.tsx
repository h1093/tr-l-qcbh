import React, { useState } from 'react';
import { HistoryItem, LinhCan, TinhAnh } from '../types';

interface HistoryPanelProps {
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
  onCompare: (builds: [HistoryItem, HistoryItem]) => void;
}

const IconHistory: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconTrash: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

const IconScale: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52v16.5m-1.5-16.5v16.5m0 0a48.417 48.417 0 0 1-7.5 0m7.5 0v-16.5m0 16.5c-1.01.203-2.01.377-3 .52m-3-.52-1.5-16.5m-1.5 16.5v-16.5" />
  </svg>
);

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onSelect, onClear, onCompare }) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  if (history.length === 0) {
    return null; 
  }

  const handleCompareSelect = (itemId: string) => {
    setSelectedForCompare(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(itemId)) {
        newSelection.delete(itemId);
      } else {
        if (newSelection.size < 2) {
          newSelection.add(itemId);
        } else {
          // Replace the first item if we already have 2
          const firstItem = newSelection.values().next().value;
          newSelection.delete(firstItem);
          newSelection.add(itemId);
        }
      }
      return Array.from(newSelection);
    });
  };

  const handleCompareClick = () => {
    if (selectedForCompare.length === 2) {
      const build1 = history.find(h => h.id === selectedForCompare[0]);
      const build2 = history.find(h => h.id === selectedForCompare[1]);
      if (build1 && build2) {
        onCompare([build1, build2]);
        setSelectedForCompare([]); // Reset selection after comparing
      }
    }
  };

  const formatSecondaryText = (item: HistoryItem) => {
    const parts = [];
    if (item.linhCan && item.linhCan !== LinhCan.None) {
      parts.push(item.linhCan);
    }
    if (item.tinhAnh && item.tinhAnh !== TinhAnh.None) {
      parts.push(item.tinhAnh);
    }
    parts.push(item.playstyle);
    return parts.join(' • ');
  };

  const canCompare = selectedForCompare.length === 2;

  return (
    <div className="mt-8">
      <div className="bg-brand-surface p-6 rounded-lg shadow-lg border border-gray-700/50 animate-fade-in-up" style={{ animationDelay: '200ms', opacity: 0 }}>
        <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
          <h2 className="text-xl font-bold flex items-center gap-3 text-brand-text">
            <IconHistory className="w-6 h-6 text-brand-secondary" />
            Lịch Sử Build
          </h2>
          <div className="flex items-center gap-3">
             <button 
              onClick={handleCompareClick} 
              disabled={!canCompare}
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md text-brand-text bg-brand-primary/80 hover:bg-brand-primary border border-brand-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="So sánh các build đã chọn"
            >
              <IconScale className="w-4 h-4" />
              So Sánh ({selectedForCompare.length}/2)
            </button>
            <button 
              onClick={onClear} 
              className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-md text-red-400 bg-red-900/20 hover:bg-red-900/50 border border-red-500/30 transition-colors duration-200"
              aria-label="Xóa lịch sử build"
            >
              <IconTrash className="w-4 h-4" />
              Xóa Lịch Sử
            </button>
          </div>
        </div>
        <ul className="space-y-2 max-h-72 overflow-y-auto pr-2 -mr-2">
          {history.map(item => {
            const isSelectedForCompare = selectedForCompare.includes(item.id);
            return (
            <li key={item.id} className="flex items-center gap-2">
              <input 
                type="checkbox"
                id={`compare-${item.id}`}
                checked={isSelectedForCompare}
                onChange={() => handleCompareSelect(item.id)}
                className="w-5 h-5 bg-gray-700 border-gray-500 rounded text-brand-primary focus:ring-brand-primary focus:ring-2 cursor-pointer"
              />
              <button 
                onClick={() => onSelect(item)} 
                className={`w-full flex justify-between items-center text-left p-3 rounded-md transition-all duration-200 ${isSelectedForCompare ? 'bg-brand-primary/20 ring-2 ring-brand-primary' : 'bg-gray-800/40 hover:bg-gray-800/80'}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-text truncate">{item.paths.join(' + ')}</p>
                   <p className="text-sm text-brand-text-secondary truncate">
                    {formatSecondaryText(item)}
                  </p>
                </div>
                <div className="flex-shrink-0 ml-4 text-right">
                  <span className="text-xs text-brand-text-secondary">{new Date(item.timestamp).toLocaleDateString('vi-VN')}</span>
                  <span className="block text-xs text-brand-text-secondary">{new Date(item.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </button>
            </li>
          )})}
        </ul>
      </div>
    </div>
  );
};
