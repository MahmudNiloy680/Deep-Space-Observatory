import React, { useState, useMemo } from 'react';
import { ImageSourceInfo } from '../types';
import { CloseIcon, SearchIcon } from './Icons';

interface ImageGalleryModalProps {
  images: ImageSourceInfo[];
  currentImageId?: string;
  onClose: () => void;
  onSelect: (image: ImageSourceInfo) => void;
}

export const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ images, currentImageId, onClose, onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('a-z');

  const filteredAndSortedImages = useMemo(() => {
    let processedImages = [...images];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      processedImages = processedImages.filter(img =>
        img.name.toLowerCase().includes(lowercasedQuery) ||
        img.description.toLowerCase().includes(lowercasedQuery)
      );
    }

    processedImages.sort((a, b) => {
      if (sortOrder === 'a-z') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });

    return processedImages;
  }, [images, searchQuery, sortOrder]);

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gallery-title"
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-800">
          <h2 id="gallery-title" className="text-xl font-bold text-white">Select a Target</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors" aria-label="Close image gallery">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-shrink-0 p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search targets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          </div>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none w-full sm:w-auto bg-slate-800 border border-slate-700 rounded-md py-2 pl-3 pr-8 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="a-z">Sort: A-Z</option>
              <option value="z-a">Sort: Z-A</option>
            </select>
          </div>
        </div>

        <main className="flex-grow p-6 overflow-y-auto custom-scrollbar">
          {filteredAndSortedImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedImages.map((image) => {
                const isSelected = image.id === currentImageId;
                const borderClass = isSelected
                  ? 'border-sky-500'
                  : 'border-slate-800 hover:border-sky-500/80';

                return (
                  <div
                    key={image.id}
                    className={`bg-slate-800/50 rounded-lg overflow-hidden shadow-lg hover:shadow-sky-900/50 border-2 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group relative ${borderClass}`}
                    onClick={() => onSelect(image)}
                    role="button"
                    aria-pressed={isSelected}
                    tabIndex={0}
                    onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(image)}
                  >
                    <img src={image.thumbnailUrl} alt={image.name} className="w-full h-40 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-white group-hover:text-sky-300 transition-colors">{image.name}</h3>
                      <p className="text-sm text-slate-400 mt-1 h-16 overflow-hidden">{image.description}</p>
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 border-2 border-sky-500 rounded-lg pointer-events-none">
                        <span className="absolute bottom-2 right-2 text-xs bg-sky-500 text-white font-bold px-2 py-0.5 rounded">SELECTED</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 mx-auto text-slate-600" />
              <h3 className="mt-4 text-lg font-semibold text-white">No Targets Found</h3>
              <p className="mt-1 text-slate-400">Try adjusting your search query.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};