import {
  LatLng, LatLngBounds,
  LatLngLiteral, LatLngBoundsLiteral,
  mediaType, mediaSubtype,
  optionsQuery, optionsFilter, optionsSort,
  cameraRollPhoto
} from './camera-roll.types';

import {
  GeoJson, GeoJsonPoint,
  GpsRegion, CircularGpsRegion,
  distanceBetweenLatLng
} from "./location-helper";

// import {cameraRoll as cameraRollAsJsonString} from "./dev-raw-camera-roll";

declare var exec;
declare var require;
declare var cameraRollAsJsonString;
exec = require('cordova/exec');
declare var window;
const PLUGIN_KEY = "cordova.plugins.CameraRollLocation";

function _localTimeAsDate(localTime:string): Date {
  try {
    let dt = new Date(localTime);
    if (isNaN(dt as any as number) == false)
      return dt;

    // BUG: Safari does not parse time strings to Date correctly  
    const [,d,h,m,s] = localTime.match( /(.*)\s(\d*):(\d*):(\d*)\./)
    dt = new Date(d);
    dt.setHours(parseInt(h), parseInt(m), parseInt(s));
    // console.log(`localTimeAsDate=${dt.toISOString()}`)
    return dt;
  } catch (err) {
    throw new Error(`Invalid localTime string, value=${localTime}`);
  }
}

export class CameraRollWithLoc {

  protected _photos : cameraRollPhoto[] = [];
  protected _filter : optionsFilter = {};
  protected _filteredPhotos : cameraRollPhoto[];

  private _isProcessing: Promise<cameraRollPhoto[]>;

  static sortPhotos(
    photos : cameraRollPhoto[]
    , options : optionsSort[] = [{key:'dateTaken', descending: false}]
    , replace: boolean = true) : cameraRollPhoto[]
  {
    // TODO: only use first sort option right now
    const sort : optionsSort = options[0];
    // console.log(`>>> _keys(_): ${_keys(_).slice(10,20)}`);
    // const sorted = _sortBy( photos, (o) => {
    //   return (o as any)[ sort.key ]
    // });
    // if (sort.descending) sorted.reverse();
    //
    const sorted = Array.from(photos);
    const desc : number = sort.descending ? -1 : 1;
    sorted.sort( (...args: any[])=>{
      let [valueA, valueB] = args.map( (o)=>{
        let value = o[sort.key];
        if (typeof value == "string") value = value.toUpperCase()
        return value;
      })
      if ( valueA < valueB ) return -1 * desc;
      if ( valueA > valueB ) return 1 * desc;
      if ( valueA == valueB ) return 0;
    })
    return sorted;
  }

  static groupPhotos(
    photos : cameraRollPhoto[]
    , options?: any
  ) : any
  {
    const MAX_DELTA = {
      time: 300,    // seconds
      distance: 10  // meters
    };
    const sortedPhotos = CameraRollWithLoc.sortPhotos( photos, [{key:'dateTaken', descending: false}])
    const grouped : { [key:string]: any } = [];
    let _counter: any = {
      prev: undefined,
      cur: undefined,
      next: undefined,
    }
    const _deltas = function( photos: any[], i: number ) : [number, cameraRollPhoto, number] {
      let result : [number, cameraRollPhoto, number];
      _counter.prev = _counter.cur || undefined;
      _counter.cur = _counter.next || new Date(photos[i].dateTaken);
      _counter.next = i < photos.length-1 ? new Date(photos[i+1].dateTaken) : undefined;
      if (_counter.prev && !_counter.next)
        result = [(_counter.cur - _counter.prev) /1000 as number, photos[i], 99999]
      else if (!_counter.prev && _counter.next)
        result = [99999, photos[i], (_counter.next - _counter.cur) / 1000 as number]
      else
        result = [
          (_counter.cur - _counter.prev) /1000 as number,
          photos[i],
          (_counter.next - _counter.cur) /1000 as number
        ]
      return result
    }
    enum Decode {
      Before, Photo, After
    }
    let photoGroup : cameraRollPhoto[];
    sortedPhotos.forEach((o, i, l)=>{
      const d = _deltas(l, i)
      if (d[0] > MAX_DELTA.time && d[2] > MAX_DELTA.time) {
        // singleton
        grouped[ `${i}` ] = d[1];
      } else if (d[0] <= MAX_DELTA.time && d[2] > MAX_DELTA.time) {
        // last of group
        photoGroup.push( d[1] );
        // grouped[ `${i - photoGroup.length}, ${photoGroup.length}` ] = photoGroup;
        photoGroup = [];
      } else if (d[0] > MAX_DELTA.time && d[2] <= MAX_DELTA.time) {
        // first of group
        photoGroup = [d[1]]
        grouped[ `${i}` ] = photoGroup;
      } else {
        // check distance between
        const tail = photoGroup[photoGroup.length -1];
        const distance = distanceBetweenLatLng(tail.location, d[1].location)
        if (distance < MAX_DELTA.distance)  // meters
          photoGroup.push( d[1] );
        else {
          // console.info(`location moved, close group, i=${grouped['indexOf'](photoGroup)}, length=${photoGroup.length}`);
          photoGroup = [d[1]]
          grouped[ `${i}` ] = photoGroup;
        }
      }
    });
    return grouped;
  }

  constructor () { }

  /**
   * get cameraRollPhoto[] from CameraRoll using Plugin,
   * uses cached values by default, ignore with force==true
   * filter later in JS
   * @param  {optionsQuery}                  interface optionsQuery
   * @param  {boolean = false}      refresh
   * @return {Promise<cameraRollPhoto[]>}         [description]
   */
  queryPhotos(options?: optionsQuery, force:boolean = false) : Promise<cameraRollPhoto[]>{
    if (!this._isProcessing && this._photos.length && !options && force==false) {
      // resolve immediately with cached value
      return Promise.resolve(this._photos);
    }
    
    if (this._isProcessing && !options && force==false){
      // wait for promise to resolve
      return this._isProcessing;
    }

    let context:string;
    let plugin:any;
    if (typeof exec == "function") context = 'cordova';
    else {
      plugin = window && window.cordova && window.cordova.plugins && window.cordova.plugins.CameraRollLocation;
      if (plugin) context = 'plugin';
    }
    switch (context){
      case 'cordova':
        // const args0 = _pick(options, ["from", "to", "mediaType", "mediaSubType"]);
        const args0 : any = {};
        ["from", "to", "mediaType", "mediaSubType"].forEach( k=>{
          if (options.hasOwnProperty(k) && options[k] != undefined ) args0[k] = options[k];
        });
        // map startDate=>from, endDate=>to as a convenience
        if (options && !options.from && options['startDate']) options.from = options['startDate']
        if (options && !options.to && options['endDate']) options.to = options['endDate']

        const methodName = "getByMoments";
        this._isProcessing = new Promise<string>(
          (resolve,reject)=>{
            // cordova.exec()
            exec(
              resolve, reject,
              "cameraRollLocation",
              methodName, [args0]
            );
          }
        )
        .then( (result:string)=>{
          try {
            if (result == undefined) result = "[]";
            const data : cameraRollPhoto[] = JSON.parse(result);
            return Promise.resolve(data);
          } catch (err) {
            return Promise.reject({error: err, response: result})
          }
        })
        break;
      case 'plugin':
        this._isProcessing = plugin.getMoments(options);
        break;
      default:  // browser environment
        if (!cameraRollAsJsonString) {
          this._isProcessing = Promise.reject("ERROR: cordova plugin error, cordova not available??!?");
        } else {
          if (!this._photos.length) {
            console.warn("cordova.plugins.CameraRollLocation not available, using sample data");
            try {
              let parsed = JSON.parse( cameraRollAsJsonString ) as cameraRollPhoto[];
              this._photos = parsed;
            } catch (e) {
              console.error( "Error parsing JSON" );
            }
          }
          this._isProcessing = Promise.resolve(this._photos)
        }
        break;
    }
    return this._isProcessing.then( (photos)=>{
      photos.forEach( (o:any)=> {
        if (o.location && o.location instanceof GeoJsonPoint == false ) {
          o.location = new GeoJsonPoint(o.location);
        }
      });
      this._isProcessing = null;
      return this._photos = photos;
    })
  }

  /**
   * filter photos in cameraRoll
   * @param  {optionsFilter}          {startDate:, endDate, locationName, mediaType}
   * @param  {boolean        = true}        replace, replaces existing filter by default
   *    use replace=false to merge with current filter
   * @return Promise<cameraRollPhoto[]>
   */
  filterPhotos (options : optionsFilter = {}, replace: boolean = true) : Promise<cameraRollPhoto[]> {
    if (replace) {
      Object.assign(this._filter, options)
    } else {
      this._filter = options
    }
    let {
      startDate : from, endDate : to,
      locationName,
      mediaType, isFavorite,
      near, containsFn, bounds
    } = this._filter;
    let result = this._photos;

    // cache value outside filter() loop
    let gpsRegion : GpsRegion;

    // from, to expressed in localTime via from = new Date([date string])
    // let fromAsLocalTime = new Date(from.valueOf() - from.getTimezoneOffset()*60000).toJSON()
    result = result.filter( (o : any) => {
      // filter on localTime
      if (from && _localTimeAsDate(o['localTime']) < from) return false;
      if (to && _localTimeAsDate(o['localTime']) > to) return false;
      if (locationName
        && false === o['momentLocationName'].startsWith(locationName)
        ) return false;

      if (mediaType && mediaType.indexOf(o['mediaType']) == -1) return false;
      if (isFavorite && false === o['isFavorite']) return false;

      if (near) {
        if (!o['location']) return false;
        gpsRegion = gpsRegion || new CircularGpsRegion(near.point, near.distance)
        let loc = new GeoJsonPoint(o['location'].coordinates)
        if (gpsRegion.contains(loc) == false) return false;
      }

      if (typeof containsFn == "function"
        && containsFn( o['location'] ) == false
      ) return false;

      if (bounds && typeof bounds.contains == "function"
        && bounds.contains( o['location'] ) == false
      ) {
        return false;
      }

      // everything good
      return true;
    });
    this._filteredPhotos = result || [];
    return Promise.resolve(this._filteredPhotos);
  }


  /**
   * Sort Photos
   * @param  {optionsSort}       options  {key:, descending:}
   * @return Promise<cameraRollPhoto[]>
   */
  sortPhotos (
    options : optionsSort[] = [{key:'dateTaken', descending: true}]
    , replace: boolean = true
  ) : Promise<cameraRollPhoto[]>
  {
    // call static method
    this._filteredPhotos = CameraRollWithLoc.sortPhotos(this._filteredPhotos, options, replace);
    return Promise.resolve(this._filteredPhotos);
  }

  /**
   * cluster photos by dateTaken+location
   * @param  {any} options [description]
   * @return {any}         [description]
   */
  groupPhotos (
    options?: any
  ) : any {
    const copyOfPhotos = Array.from(this._filteredPhotos);
    // call static method
    const grouped = CameraRollWithLoc.groupPhotos(copyOfPhotos, options);
    console.log( Object.keys(grouped) );
    return grouped;
  }

  getPhotos ( limit : number = 10 ) : cameraRollPhoto[] {
    let result = this._filteredPhotos || this._photos || [];
    if (!result.length) {
      console.warn("CameraRoll: no photos found. check query/filter");
    }

    result = result.slice(0, limit);
    result.forEach( (o)=> {
      if (o.location instanceof GeoJsonPoint == false ) {
        o.location = new GeoJsonPoint(o.location);
      }
    });
    return result
  }

}
