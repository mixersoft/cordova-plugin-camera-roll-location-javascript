import { cameraRollPhoto, NodeCallback, optionsGetCameraRoll, optionsGetByMoments } from './camera-roll.types';
import { CameraRollWithLoc } from './camera-roll.service';

/**
 * instantiate CameraRollWithLoc() and use in Cordova plugin method: getByMoments()
 */
var plugin = new CameraRollWithLoc();
/**
 * This is the ACTUAL cordova plugin method call
 * plugin method wrapper for CameraRollWithLoc class
 * calls (ios/swift) CameraRollLocation.getByMoments() using plugin exec
 * swift: func getByMoments(from from: NSDate? = nil, to: NSDate? = nil) -> [PhotoWithLoc]
 *
 * @param  {optionsGetCameraRoll}   options {from:, to: mediaType: mediaSubtypes: }
 * @param  callback()              OPTIONAL nodejs style callback, i.e. (err, resp)=>{}
 * @return Promise() or void       returns a Promise if callback is NOT provided
 */
export function getCameraRoll(
  options : optionsGetCameraRoll
  , callback: NodeCallback
) : Promise<cameraRollPhoto[]>
{
  var promise = plugin.queryPhotos(options)
  if (typeof callback == "function") {
    promise.then( (result)=>{
      callback(null, result);
      return result;
    }
    , (err)=>{
      callback(err, undefined);
      return Promise.reject(err);
    });
  }
  return promise;
}


// deprecate
export function getByMoments(
  options : optionsGetCameraRoll
  , callback: NodeCallback
) : Promise<cameraRollPhoto[]>
{
  return getCameraRoll(options, callback);
}

