import { ImageSourceInfo } from '../types';
import { imageSources } from '../data/images';

/**
 * Simulates fetching image source data from a backend API.
 * @returns A promise that resolves with an array of ImageSourceInfo.
 */
export const fetchImageSources = (): Promise<ImageSourceInfo[]> => {
  return new Promise((resolve) => {
    // Simulate a network delay of 500ms
    setTimeout(() => {
      resolve(imageSources);
    }, 500);
  });
};