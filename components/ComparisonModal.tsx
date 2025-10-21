import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { HistoryItem } from '../types';

const ReactMarkdown = (window as any).ReactMarkdown;
const remarkGfm = (window as any).remarkGfm;

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  result: string | null;
  builds: [HistoryItem, HistoryItem] | null;
}

const IconX: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


export const ComparisonModal: React.FC<ComparisonModalProps> = ({ isOpen, onClose, isLoading, result, builds }) => {
  if (!isOpen) return null;

  return (
    <div 
        className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-fade-in"
        onClick={onClose}
        aria-modal="true"
        role="dialog"
    >
      <div 
        className="bg-brand-surface w-full max-w-4xl h-[90vh] flex flex-col rounded-lg shadow-2xl border border-gray-700/50 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700/50 flex-shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm sm:text-base">
                {builds && (
                    <>
                        <span className="font-bold text-brand-primary">{builds[0].paths.join(' + ')}</span>
                        <span className="text-brand-text-secondary">vs.</span>
                        <span className="font-bold text-brand-secondary">{builds[1].paths.join(' + ')}</span>
                    </>
                )}
            </div>
            <button 
                onClick={onClose} 
                className="p-1 rounded-full text-brand-text-secondary hover:bg-gray-700/50 transition-colors"
                aria-label="Đóng"
            >
                <IconX className="w-6 h-6" />
            </button>
        </header>

        <main className="p-6 overflow-y-auto flex-grow">
          {isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <LoadingSpinner />
              <p className="mt-4 text-lg text-brand-text-secondary">AI đang luận võ, so kè từng chiêu thức...</p>
            </div>
          )}
          {result && (
            <article className="prose prose-invert text-brand-text leading-relaxed prose-p:my-3 prose-headings:text-brand-secondary prose-strong:text-brand-primary prose-a:text-brand-secondary hover:prose-a:text-brand-primary max-w-none prose-ul:list-disc prose-ol:list-decimal prose-li:my-1 prose-table:border prose-table:border-gray-600 prose-th:border prose-th:border-gray-600 prose-th:p-2 prose-td:border prose-td:border-gray-600 prose-td:p-2">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{result}</ReactMarkdown>
            </article>
          )}
        </main>
      </div>
    </div>
  );
};
