angular.module('starter')

  .controller('LoginCtrl', function ($scope, $state) {
    $scope.password = 1;
    $scope.login = function () {
      $scope.password++;
      if ($scope.password > 4) {
        $state.go('tab.calendar');
      }
    }

  })
