angular.module('starter')

  .controller('IntroCtrl', function ($scope, $state, $timeout) {

    $timeout(function () {
      $state.go('login')
    }, 3000)

  })
