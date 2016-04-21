angular.module('starter')
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
