import React, { useState, useCallback, useEffect } from 'react';
import { InteractiveImageViewer } from './components/InteractiveImageViewer';
import { AnalysisResult, Selection, ImageSourceInfo } from './types';
import { analyzeImageRegion } from './services/geminiService';
import { InfoPanel } from './components/InfoPanel';
import { LogoIcon, GalleryIcon, AnalyzeIcon } from './components/Icons';
import { fetchImageSources } from './services/apiService';
import { ImageGalleryModal } from './components/ImageGalleryModal';
import { IntroOverlay } from './components/IntroOverlay';

type InfoPanelTab = 'description' | 'analysis';

const App: React.FC = () => {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult>({ status: 'idle', text: null });
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState<ImageSourceInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentImage, setCurrentImage] = useState<ImageSourceInfo | null>(null);
  const [activeInfoTab, setActiveInfoTab] = useState<InfoPanelTab>('description');
  const [imageDataToAnalyze, setImageDataToAnalyze] = useState<string | null>(null);

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);
        const images = await fetchImageSources();
        setGalleryImages(images);
        if (images.length > 0) {
          setCurrentImage(images[0]);
        }
      } catch (error) {
        console.error("Failed to fetch image sources:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadImages();
  }, []);

  const handleAnalysis = useCallback(async () => {
    if (!imageDataToAnalyze) return;
    setAnalysis({ status: 'loading', text: null });
    setActiveInfoTab('analysis');
    try {
      const resultText = await analyzeImageRegion(imageDataToAnalyze);
      setAnalysis({ status: 'success', text: resultText });
    } catch (error) {
      console.error("Analysis failed:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      setAnalysis({ status: 'error', text: `Failed to analyze region: ${errorMessage}` });
    } finally {
      setImageDataToAnalyze(null); // Clear image data after analysis
    }
  }, [imageDataToAnalyze]);
  
  const handleSelectionChange = (newSelection: Selection | null) => {
    setSelection(newSelection);
    if (!newSelection) {
      setAnalysis({ status: 'idle', text: null });
      setImageDataToAnalyze(null);
      if(activeInfoTab === 'analysis') {
        setActiveInfoTab('description');
      }
    }
  };

  const handleImageSelect = (image: ImageSourceInfo) => {
    if (currentImage?.id === image.id) {
        setIsGalleryOpen(false);
        return;
    }
    setCurrentImage(image);
    handleSelectionChange(null);
    setActiveInfoTab('description');
    setIsGalleryOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans flex flex-col overflow-hidden">
      <IntroOverlay isVisible={isLoading} />
      <header className="px-4 py-3 md:px-6 md:py-3 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 shadow-lg flex items-center justify-between gap-4 z-40 flex-shrink-0">
        <div className="flex items-center gap-3">
          <LogoIcon className="w-8 h-8 text-sky-400" />
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-white">
              Deep Space Observatory
            </h1>
            <p className="text-xs md:text-sm text-slate-400">AI-Powered Analysis</p>
          </div>
        </div>
        <button 
          onClick={() => setIsGalleryOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md text-sm font-medium text-sky-300 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          aria-label="Browse image targets"
        >
          <GalleryIcon className="w-5 h-5" />
          {isLoading ? 'Loading...' : 'Browse Targets'}
        </button>
      </header>
      <div className="flex-grow flex overflow-hidden">
        <main className="flex-grow flex flex-col relative">
          <div className="flex-grow relative w-full h-full">
            {currentImage ? (
              <InteractiveImageViewer 
                key={currentImage.id}
                tileSource={currentImage.tileSource}
                onSelectionChange={handleSelectionChange}
                selection={selection}
                onSelectionFinalized={setImageDataToAnalyze}
              />
            ) : !isLoading && (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-center p-4">
                <p className="text-lg font-semibold text-white">Datalink Error</p>
                <p className="text-slate-400 mt-2">Could not load target data from the Deep Space Network. Please check connection and refresh.</p>
              </div>
            )}
             {selection && imageDataToAnalyze && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20">
                    <button 
                        onClick={handleAnalysis}
                        className="flex items-center gap-3 px-6 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg shadow-2xl shadow-sky-900/50 transform transition-transform hover:scale-105"
                    >
                        <AnalyzeIcon className="w-6 h-6" />
                        Analyze Sector
                    </button>
                </div>
            )}
          </div>
        </main>
        
        <InfoPanel 
          currentImage={currentImage}
          analysis={analysis}
          activeTab={activeInfoTab}
          onTabChange={setActiveInfoTab}
          onCloseAnalysis={() => handleSelectionChange(null)}
        />
      </div>
      
      {isGalleryOpen && (
        <ImageGalleryModal 
          images={galleryImages}
          currentImageId={currentImage?.id}
          onClose={() => setIsGalleryOpen(false)}
          onSelect={handleImageSelect}
        />
      )}
    </div>
  );
};

export default App;