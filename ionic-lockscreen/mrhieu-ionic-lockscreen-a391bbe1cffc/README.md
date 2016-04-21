Lockscreen (not login screen) made easy with this plugin. You will have a beautiful and minimal look for your lockscreen. The use cases might be: lock the access to a particular route or function, lock sensitive information, or typically be the very first screen for your diary/journal/finance app.

It comes as a angularjs service which is dead easy to integrate with your working project.

I haven't yet tested on a windows phone device but it should work properly.

##Features
1. Built-in numpad, consistent look throughout the platforms
2. Vibrate if entering the incorrect passcode
3. Configurable default length of the passcode
4. Written as a service

##Demo
1. Download the zip file containing the entire demo app and unzip
2. Go inside the extracted folder
3. Run `$ npm install`
4. Run `$ bower install`
5. Try: `$ ionic serve`
6. The browser should automatically open the app

##Usage
Inside lockscreen.js
**Modify the default values**
```
.constant('constant', {
    DEFAULT_LENGTH: 4,
    THEME: 'button-outline button-assertive'
  })
```
Notice: this can be dynamically passed as a binding value

**In your controller**
```
.controller('homeCtrl', function($scope, Lockscreen) {
    // The correct passcode to pass into lockscreen directive
    $scope.correctPasscode = '1234';

    $scope.showLockscreen = function() {
      Lockscreen.open($scope.correctPasscode)
        .then(function() {
          console.log('Correct!');
        })
    }
  })
```



##Dependencies
If you want to integrate this plugin into your project, don't forget these dependencies
1. Jquery `$ bower install jquery --save`
2. ngCordova `$ bower install ngCordova --save`
3. $cordovaVibration `$ cordova plugin add org.apache.cordova.vibration`
4. Setup SASS `$ ionic setup sass`
5. CSS file path `./scss/lockscreen.sass`
6. JS file path `./www/js/lockscreen.js`


##Support
If you need technical support or have any questions, don't hesitate to send me a message via: mr_hie@yahoo.com