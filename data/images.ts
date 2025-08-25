import { ImageSourceInfo } from '../types';

export const imageSources: ImageSourceInfo[] = [
  {
    id: 'lro-moon',
    name: 'Lunar Reconnaissance Orbiter',
    description: "A global mosaic of our Moon, captured by the LRO's Wide Angle Camera.",
    thumbnailUrl: 'https://solarsystem.nasa.gov/system/stellar_items/image_files/38_moon_400x400.jpg',
    tileSource: {
      width: 131072,
      height: 65536,
      tileSize: 256,
      tileOverlap: 0,
      minLevel: 9,
      maxLevel: 17,
      /**
       * This function constructs the tile URL based on the WMTS (Web Map Tile Service)
       * format provided by NASA's Trek service.
       * The generic format is: {endpoint}/1.0.0/{Style}/{TileMatrixSet}/{TileMatrix}/{TileRow}/{TileCol}.jpg
       * Here, we map OpenSeaDragon's internal zoom 'level' to the service's 'TileMatrix' (z).
       */
      getTileUrl: function(level: number, x: number, y: number): string {
        const z = level - 9; // Map OSD level to NASA's z-level (0-8)
        return `https://trek.nasa.gov/tiles/Moon/EQ/LRO_WAC_Mosaic_Global_303ppd_v02/1.0.0/default/default028mm/${z}/${y}/${x}.jpg`;
      },
    }
  },
  {
    id: 'whirlpool-galaxy',
    name: 'Whirlpool Galaxy (M51)',
    description: 'A classic spiral galaxy, notable for its well-defined spiral arms and its companion galaxy, NGC 5195.',
    thumbnailUrl: 'https://cdn.worldwidetelescope.org/wwtweb/thumbnail.aspx?name=m51',
    tileSource: 'https://cdn.worldwidetelescope.org/wwtweb/dzi/m51.dzi'
  },
  {
    id: 'andromeda-galaxy',
    name: 'Andromeda Galaxy (M31)',
    description: 'The largest and sharpest-ever image of our galactic neighbor, Andromeda.',
    thumbnailUrl: 'https://cdn.worldwidetelescope.org/wwtweb/thumbnail.aspx?name=heic1502a_10000',
    tileSource: 'https://cdn.worldwidetelescope.org/wwtweb/dzi/heic1502a_10000.dzi'
  }
];