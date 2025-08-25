import React from 'react';
import { AnalysisResult, ImageSourceInfo } from '../types';
import { CloseIcon, ErrorIcon, SuccessIcon, SpinnerIcon, InfoIcon, AIIcon } from './Icons';

type InfoPanelTab = 'description' | 'analysis';

interface InfoPanelProps {
  currentImage: ImageSourceInfo | null;
  analysis: AnalysisResult;
  activeTab: InfoPanelTab;
  onTabChange: (tab: InfoPanelTab) => void;
  onCloseAnalysis: () => void;
}

const TabButton: React.FC<{
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'bg-slate-700 text-sky-300';
  const inactiveClasses = 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-sky-400';
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      {label}
    </button>
  );
};

const DescriptionPanel: React.FC<{ image: ImageSourceInfo }> = ({ image }) => (
  <div className="p-4 animate-fade-in">
    <img src={image.thumbnailUrl} alt={image.name} className="w-full h-48 object-cover rounded-md" />
    <h3 className="mt-4 text-xl font-bold text-white">{image.name}</h3>
    <p className="mt-2 text-sm text-slate-300 leading-relaxed">{image.description}</p>
  </div>
);

const AnalysisContent: React.FC<{ analysis: AnalysisResult; onClose: () => void }> = ({ analysis, onClose }) => {
    switch(analysis.status) {
        case 'loading':
            return (
                <div className="flex flex-col items-center justify-center p-4 h-full text-slate-400 text-center">
                    <SpinnerIcon className="w-8 h-8 text-sky-400" />
                    <p className="mt-4 text-sm font-semibold text-sky-300">ANALYZING SECTOR...</p>
                    <p className="mt-1 text-xs">Please wait while the AI processes the image data.</p>
                </div>
            );
        case 'error':
            return (
                <div className="flex flex-col items-center justify-center p-4 h-full text-center">
                    <ErrorIcon className="w-10 h-10 text-red-400" />
                    <p className="mt-4 text-sm font-semibold text-red-400">ANALYSIS FAILED</p>
                    <p className="mt-1 text-xs text-slate-400 overflow-y-auto max-h-24 custom-scrollbar">{analysis.text || "An unknown error occurred."}</p>
                </div>
            );
        case 'success':
            return (
                <div className="p-4 text-sm text-slate-300 leading-relaxed overflow-y-auto custom-scrollbar h-full animate-fade-in">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{analysis.text || "No analysis returned."}</p>
                </div>
            );
        case 'idle':
        default:
            return (
                <div className="flex flex-col items-center justify-center p-4 h-full text-slate-500 text-center">
                    <AIIcon className="w-10 h-10" />
                    <p className="mt-4 text-sm font-semibold">AI Analysis Idle</p>
                    <p className="mt-1 text-xs">Select a region on the main image and click "Analyze Sector" to begin.</p>
                </div>
            );
    }
}


export const InfoPanel: React.FC<InfoPanelProps> = ({ currentImage, analysis, activeTab, onTabChange, onCloseAnalysis }) => {
  return (
    <aside className="w-full md:w-1/3 lg:w-1/4 max-w-sm flex-shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col">
      <div className="flex-shrink-0 bg-slate-800/50">
        <div className="flex">
          <TabButton
            label="Target Info"
            icon={<InfoIcon className="w-5 h-5" />}
            isActive={activeTab === 'description'}
            onClick={() => onTabChange('description')}
          />
          <TabButton
            label="AI Analysis"
            icon={<AIIcon className="w-5 h-5" />}
            isActive={activeTab === 'analysis'}
            onClick={() => onTabChange('analysis')}
          />
        </div>
      </div>
      <div className="flex-grow min-h-0 overflow-y-auto custom-scrollbar">
        {activeTab === 'description' && currentImage && (
            <DescriptionPanel image={currentImage} />
        )}
        {activeTab === 'analysis' && (
            <AnalysisContent analysis={analysis} onClose={onCloseAnalysis} />
        )}
      </div>
    </aside>
  );
};
