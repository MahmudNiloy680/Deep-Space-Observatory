
export interface Selection {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type AnalysisStatus = 'idle' | 'loading' | 'success' | 'error';

export interface AnalysisResult {
  status: AnalysisStatus;
  text: string | null;
}

export interface ImageSourceInfo {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  tileSource: any; // Can be a string (URL to DZI) or an OpenSeaDragon.TileSource object
}