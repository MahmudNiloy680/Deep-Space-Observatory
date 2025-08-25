import React from 'react';
import { SpinnerIcon } from './Icons';

interface IntroOverlayProps {
  isVisible: boolean;
}

export const IntroOverlay: React.FC<IntroOverlayProps> = ({ isVisible }) => {
    const overlayClass = isVisible 
      ? 'opacity-100' 
      : 'opacity-0 pointer-events-none';

    return (
        <div className={`fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center transition-opacity duration-500 ${overlayClass}`}>
            <div className="text-center">
                <SpinnerIcon className="w-12 h-12 text-sky-400 mx-auto" />
                <p className="mt-4 text-lg text-sky-300 tracking-widest">
                    INITIALIZING SYSTEM...
                </p>
                <p className="text-xs text-slate-500 mt-2">
                    DEEP SPACE OBSERVATORY
                </p>
            </div>
        </div>
    );
};