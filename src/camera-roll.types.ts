import { GeoJson, GeoJsonPoint } from "./location-helper";

export interface optionsPlugin {
  from?: Date,
  to?: Date,
  mediaType?: mediaType,
  mediaSubtype?: mediaSubtype
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
  location: GeoJsonPoint,
  dateTaken: string, // isoDate
  localTime: string, // YYYY-MM-DD HH:MM:SS.SSS
  mediaType: number,
  mediaSubtype: number,
  momentId?: string,
  momentLocationName?: string
}

export interface optionsGetByMoments {
  from?: Date,
  to?: Date,
  mediaType?: mediaType,
  mediaSubtype?: mediaSubtype
}

export interface NodeCallback {
  (err: any, data: any): void;
}


/**
 * A LatLng is a point in geographical coordinates: latitude and longitude.
 *
 * * Latitude ranges between -90 and 90 degrees, inclusive. Values above or
 *   below this range will be clamped to the range [-90, 90]. This means
 *   that if the value specified is less than -90, it will be set to -90.
 *   And if the value is greater than 90, it will be set to 90.
 * * Longitude ranges between -180 and 180 degrees, inclusive. Values above
 *   or below this range will be wrapped so that they fall within the
 *   range. For example, a value of -190 will be converted to 170. A value
 *   of 190 will be converted to -170. This reflects the fact that
 *   longitudes wrap around the globe.
 *
 * Although the default map projection associates longitude with the
 * x-coordinate of the map, and latitude with the y-coordinate, the
 * latitude coordinate is always written first, followed by the longitude.
 * Notice that you cannot modify the coordinates of a LatLng. If you want
 * to compute another point, you have to create a new one.
 */
export interface LatLng {
    /**
     * Creates a LatLng object representing a geographic point.
     * Note the ordering of latitude and longitude.
     * @param lat Latitude is specified in degrees within the range [-90, 90].
     * @param lng Longitude is specified in degrees within the range [-180, 180].
     * @param noWrap Set noWrap to true to enable values outside of this range.
     */
    // constructor(lat: number, lng: number, noWrap?: boolean);
    /** Comparison function. */
    equals(other: LatLng): boolean;
    /** Returns the latitude in degrees. */
    lat(): number;
    /** Returns the longitude in degrees. */
    lng(): number;
    /** Converts to string representation. */
    toString(): string;
    /** Returns a string of the form "lat,lng". We round the lat/lng values to 6 decimal places by default. */
    toUrlValue(precision?: number): string;
}

export type LatLngLiteral = { lat: number; lng: number }
export type LatLngBoundsLiteral = { east: number; north: number; south: number; west: number }

export interface LatLngBounds {
    // constructor(sw?: LatLng|LatLngLiteral, ne?: LatLng|LatLngLiteral);
    contains(latLng: LatLng): boolean;
    equals(other: LatLngBounds|LatLngBoundsLiteral): boolean;
    extend(point: LatLng): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    intersects(other: LatLngBounds|LatLngBoundsLiteral): boolean;
    isEmpty(): boolean;
    toSpan(): LatLng;
    toString(): string;
    toUrlValue(precision?: number): string;
    union(other: LatLngBounds|LatLngBoundsLiteral): LatLngBounds;
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
