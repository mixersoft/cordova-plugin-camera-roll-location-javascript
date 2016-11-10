# cordova-plugin-camera-roll-location-javascript

This is a Typescript project for building the Javascript side of the
`CameraRollLocation` cordova plugin. Additional effort was made to support plugin invocation using promises.

### Usage Example

```Typescript
const plugin : any = cordova.plugins.CameraRollLocation;
let pr: Promise<cameraRollPhoto[]> = plugin.getByMoments(options, false)
.then( (photos)=>{
  this._photos = photos;
})
```

## Overview
Cordova Plugin: `CameraRollLocation`
> * ref: `cordova.plugins.CameraRollLocation`
> * id: `"com-snaphappi-plugin-camera-roll-location"`
> * repo: `https://github.com/mixersoft/cordova-plugin-camera-roll-location.git`

## Project Config
```
npm install
# clear "./build"
tsc
```

## Cordova Installation to plugin repository
> repo: `https://github.com/mixersoft/cordova-plugin-camera-roll-location.git`

1. Copy/Paste `./build/cameraRollPhoto.js` to this location:
  ```
  www/
    CameraRollLocation.js
  ```
1. Remove "internal" `define()`
  ```
  // define("location-helper", ["require", "exports"], function (require, exports) {
  //   "use strict";
      [keep the actual js code]
  // })
  ```
1. Add locally imported vars as appropriate
  ```
  var location_helper_1 = exports;
  // ...
  var camera_roll_service_1 = exports;
  // ...

  ```

## Add plugin to ionic/cordova project
  ```
  ionic plugin add --save cordova-plugin-add-swift-support
  ionic plugin add --save "https://github.com/mixersoft/cordova-plugin-camera-roll-location.git"
  inoic build ios
  ```



## Manual Cordova Installation to xcode project

1. Copy/Paste `./build/cameraRollPhoto.js` to this location:

  ```
  Staging/
    www/
      plugins/
        com-snaphappi-plugin-camera-roll-location/
          www/
            CameraRollLocation.js
  ```
1. Paste *between* this code:
  ```
  cordova.define("com-snaphappi-plugin-camera-roll-location.CameraRollLocation", function(require, exports, module) {

    // paste `./build/cameraRollPhoto.js` here

  });
  ```
1. Remove "internal" `define()`
  ```
  // define("location-helper", ["require", "exports"], function (require, exports) {
  //   "use strict";
      [keep the actual js code]
  // })
  ```
1. Add locally imported vars as appropriate
  ```
  var location_helper_1 = exports;
  // ...
  var camera_roll_service_1 = exports;
  // ...

  ```


## Plugin Installation

This is how you install the actual cordova plugin.

```
ionic plugin add cordova-plugin-add-swift-support --save
ionic plugin add https://github.com/mixersoft/cordova-plugin-camera-roll-location.git --save
ionic build ios
```
