import { 
  LatLng, LatLngLiteral, LatLngSpeedLiteral,
  LatLngBounds,
  GeoJson, GeoJsonPoint, 
} from "./location-helper";

export interface optionsPlugin {
  from?: Date,
  to?: Date,
  mediaType?: mediaType,
  mediaSubtype?: mediaSubtype
}

export interface optionsQuery {
  from?: Date;
  to?: Date;
  mediaType?: mediaType;
  mediaSubtype?: mediaSubtype;
  [propName: string]: any;    // map startDate=>from, endDate=>to as convenience
}

export interface optionsFilter {
  startDate?: Date,
  endDate?: Date,
  locationName?: string
  mediaType?: mediaType[]
  isFavorite?: boolean
  near?: {point: GeoJsonPoint, distance: number},
  containsFn?: (location: GeoJson) => boolean ,  // google maps
  bounds?: LatLngBounds
}

export interface optionsSort {
  key: string;
  descending?: boolean;
}

export interface cameraRollPhoto {
  uuid: string,
  filename: string,
  dateTaken: string, // isoDate
  localTime: string | Date, // YYYY-MM-DD HH:MM:SS.SSS
  mediaType: number,
  mediaSubtype: number,

  width: number,
  height: number,
  duration: number,

  location?: GeoJsonPoint,      // deprecate
  position?: LatLngSpeedLiteral,
  
  momentId?: string,
  momentLocationName?: string
}

export interface optionsGetCameraRoll {
  from?: Date,
  to?: Date,
  mediaType?: mediaType,
  mediaSubtype?: mediaSubtype
}

// deprecate
export type optionsGetByMoments = optionsGetCameraRoll;


export interface NodeCallback {
  (err: any, data: any): void;
}

export interface Point {
    /** A point on a two-dimensional plane. */
    // constructor(x: number, y: number);
    /** The X coordinate */
    x: number;
    /** The Y coordinate */
    y: number;
    /** Compares two Points */
    equals(other: Point): boolean;
    /** Returns a string representation of this Point. */
    toString(): string;
}

export interface Size {
    // constructor(width: number, height: number, widthUnit?: string, heightUnit?: string);
    height: number;
    width: number;
    equals(other: Size): boolean;
    toString(): string;
}

/**
 * PHAssetMediaType
 * iOS
 * see: https://developer.apple.com/reference/photos/phasset
 */
export enum mediaType {
  Unknown, Image, Video, Audio
}

/**
 * PHAssetMediaSubtype
 */
export enum mediaSubtype {
  // see: https://developer.apple.com/library/ios/documentation/Photos/Reference/Photos_Constants/index.html#//apple_ref/c/tdef/PHAssetMediaSubtype
  None = 0,
  PhotoPanorama = 1 << 0,
  PhotoHDR = 1 << 1,
  PhotoScreenshot = 1 << 2,
  PhotoLive = 1 << 3,
  VideoStreamed = 1 << 4,
  VideoHighFrameRate = 1 << 5,
  VideoTimelapse = 1 << 6
}
