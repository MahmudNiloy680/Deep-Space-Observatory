import React, { useEffect, useRef, useState, useCallback } from 'react';
import OpenSeaDragon from 'openseadragon';
import { Selection } from '../types';
import { SpinnerIcon } from './Icons';

interface InteractiveImageViewerProps {
  tileSource: any;
  selection: Selection | null;
  onSelectionChange: (selection: Selection | null) => void;
  onSelectionFinalized: (imageDataUrl: string | null) => void;
}

const ViewerLoadingOverlay: React.FC = () => (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-2 text-sky-300">
        <SpinnerIcon className="w-8 h-8" />
        <p>Establishing Datalink...</p>
    </div>
);

export const InteractiveImageViewer: React.FC<InteractiveImageViewerProps> = ({ tileSource, selection, onSelectionChange, onSelectionFinalized }) => {
  const viewerRef = useRef<OpenSeaDragon.Viewer | null>(null);
  const viewerId = `openseadragon-viewer-${React.useId()}`;
  const [isSelecting, setIsSelecting] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (viewerRef.current) {
      viewerRef.current.destroy();
      viewerRef.current = null;
    }

    if (!tileSource) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    const viewer = OpenSeaDragon({
        id: viewerId,
        prefixUrl: 'https://openseadragon.github.io/openseadragon/images/',
        tileSources: tileSource,
        animationTime: 0.8,
        blendTime: 0.1,
        constrainDuringPan: true,
        maxZoomPixelRatio: 2,
        minZoomLevel: 0.8,
        visibilityRatio: 1,
        zoomPerScroll: 1.5,
        showNavigationControl: true,
        navigationControlAnchor: OpenSeaDragon.ControlAnchor.BOTTOM_RIGHT,
    });
    viewerRef.current = viewer;

    const openHandler = () => setIsLoading(false);
    const errorHandler = () => setIsLoading(false);

    viewer.addHandler('open', openHandler);
    viewer.addHandler('open-failed', errorHandler);

    return () => {
      viewer.removeHandler('open', openHandler);
      viewer.removeHandler('open-failed', errorHandler);
      viewerRef.current?.destroy();
      viewerRef.current = null;
    };
  }, [tileSource, viewerId]);


  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !viewerRef.current) return;
    setIsSelecting(true);
    onSelectionFinalized(null); // Clear previous analysis data
    const viewportPoint = viewerRef.current.viewport.pointFromPixel(new OpenSeaDragon.Point(e.nativeEvent.offsetX, e.nativeEvent.offsetY));
    setStartPos({ x: viewportPoint.x, y: viewportPoint.y });
    onSelectionChange({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !viewerRef.current) return;
    
    const startPixel = viewerRef.current.viewport.pixelFromPoint(new OpenSeaDragon.Point(startPos.x, startPos.y));

    const newSelection: Selection = {
      x: Math.min(startPixel.x, e.nativeEvent.offsetX),
      y: Math.min(startPixel.y, e.nativeEvent.offsetY),
      width: Math.abs(e.nativeEvent.offsetX - startPixel.x),
      height: Math.abs(e.nativeEvent.offsetY - startPixel.y),
    };
    onSelectionChange(newSelection);
  };
  
  const handleMouseUp = useCallback(() => {
    setIsSelecting(false);
    if (selection && selection.width > 20 && selection.height > 20) {
      const viewer = viewerRef.current;
      if (!viewer || !viewer.drawer) {
        onSelectionChange(null);
        return;
      }
      
      const canvas = viewer.drawer.canvas;
      if (!(canvas instanceof HTMLCanvasElement)) {
        console.error("OpenSeaDragon drawer's canvas is not an HTMLCanvasElement.");
        onSelectionChange(null);
        return;
      }

      try {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = selection.width;
        tempCanvas.height = selection.height;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
          tempCtx.drawImage(canvas, selection.x, selection.y, selection.width, selection.height, 0, 0, selection.width, selection.height);
          onSelectionFinalized(tempCanvas.toDataURL('image/jpeg', 0.9));
        }
      } catch (e) {
        console.error("Could not get image data from canvas. It might be tainted by cross-origin data.", e);
        onSelectionChange(null);
        onSelectionFinalized(null);
      }

    } else {
       onSelectionChange(null);
       onSelectionFinalized(null);
    }
  }, [selection, onSelectionChange, onSelectionFinalized]);

  const handleMouseLeave = () => {
    if (isSelecting) {
        handleMouseUp();
    }
  };

  return (
    <div className="w-full h-full relative group">
      <div id={viewerId} className="w-full h-full bg-black" />
      {isLoading && <ViewerLoadingOverlay />}
      <div 
        className="absolute top-0 left-0 w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      >
        {selection && selection.width > 0 && selection.height > 0 && (
          <div 
            className="absolute border-2 border-dashed border-sky-400 bg-sky-400/20 pointer-events-none"
            style={{
              left: selection.x,
              top: selection.y,
              width: selection.width,
              height: selection.height,
            }}
          />
        )}
      </div>
      <div className="absolute top-4 left-4 bg-slate-900/50 p-2 rounded-lg text-xs text-slate-300 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
        Pan & Zoom enabled. Drag to select a region for analysis.
      </div>
    </div>
  );
};