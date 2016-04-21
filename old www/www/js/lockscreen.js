/*
  Lockscreen

  Custom Ionic modal with the look of iOS lockscreen

  Contact me
  Email: mr_hie@yahoo.com
  Twitter: @mrhieu
*/

angular.module('lockscreen', ['ngCordova'])
  .constant('constant', {
    THEME: 'button-outline button-assertive'
  })

  .directive('animateOnChange', ['$animate', '$timeout', function($animate,$timeout) {
    return function(scope, elem, attr) {
      attr.animateClass = attr.animateClass || 'shake';

      scope.$watch(attr.animateOnChange, function(nv,ov) {
        if (nv!=ov) {
          var c = nv > ov?('animated ' + attr.animateClass):('animated ' + attr.animateClass);
          $animate.addClass(elem,c).then(function() {
            $timeout(function() {$animate.removeClass(elem,c);});
          });
        }
      });
    };
  }])

  .directive('preventBackspace', function() {
    return {
      link: function() {
        // Prevent the backspace key from navigating back.
        $(document).unbind('keydown').bind('keydown', function (event) {
          var doPrevent = false;
          if (event.keyCode === 8) {
            var d = event.srcElement || event.target;
            if ((d.tagName.toUpperCase() === 'INPUT' && 
              (
                 d.type.toUpperCase() === 'TEXT' ||
                 d.type.toUpperCase() === 'PASSWORD' || 
                 d.type.toUpperCase() === 'FILE' || 
                 d.type.toUpperCase() === 'SEARCH' || 
                 d.type.toUpperCase() === 'EMAIL' || 
                 d.type.toUpperCase() === 'NUMBER' || 
                 d.type.toUpperCase() === 'DATE' )
              ) || 
              d.tagName.toUpperCase() === 'TEXTAREA') {
              doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
          }

          if (doPrevent) {
              event.preventDefault();
          }
        });
      }
    }
  })

  .directive('passcode', function() {
    return {
      restrict: 'AE',
      template: '<div class="lock-passcode" animate-on-change="onShake">' +
                  '<i class="lock-passcode-dot ion-ios-circle-outline" ng-class="{\'ion-ios-circle-filled\': $index < value.length, \'ion-ios-circle-outline\': $index >= value.length}" ng-repeat="i in pseudoPasscode track by $index"></i>' + 
                '</div>',
      scope: {
        value: '=',
        limit: '=',
        onFill: '&',
        onShake: '='
      },
      controller: ['$scope', 'constant', function($scope, constant) {
        $scope.value = $scope.value || '';
        $scope.pseudoPasscode = [];
        $scope.shake = false;

        for (var i = 0; i < $scope.limit; i++) {
          $scope.pseudoPasscode.push('*');
        }

        var unbindWatcher = $scope.$watch('value', function(newVal) {
          if (newVal.length == $scope.limit) {
            $scope.onFill({passcode: newVal});
          }
        });

        $scope.$on('$destroy', function() {
          unbindWatcher();
        });
      }]
    }
  })

  .directive('numpad', function() {
    return {
      restrict: 'AE',
      scope: {
        output: '=',
        limit: '='
      },
      template: '<div class="lock-numpad">' +
                  '<button class="button {{theme}}" ng-click="addNumber(1)">1</button>' +
                  '<button class="button {{theme}}" ng-click="addNumber(2)">2</button>' +
                  '<button class="button {{theme}}" ng-click="addNumber(3)">3</button>' +
                  '<br>' +
                  '<button class="button {{theme}}" ng-click="addNumber(4)">4</button>' +
                  '<button class="button {{theme}}" ng-click="addNumber(5)">5</button>' +
                  '<button class="button {{theme}}" ng-click="addNumber(6)">6</button>' +
                  '<br>' +
                  '<button class="button {{theme}}" ng-click="addNumber(7)">7</button>' +
                  '<button class="button {{theme}}" ng-click="addNumber(8)">8</button>' +
                  '<button class="button {{theme}}" ng-click="addNumber(9)">9</button>' +
                  '<br>' +
                  '<button class="button {{theme}}" ng-click="clear()">C</button>' +
                  '<button class="button {{theme}}" ng-click="addNumber(0)">0</button>' +
                  '<button class="button {{theme}}" ng-click="delete()">' +
                    '<i class="ion-backspace"></i>' +
                  '</button>' +
                '</div>',
      controller: ['$scope', 'constant', function($scope, constant) {
        $scope.keys = [];
        $scope.output = $scope.output || '';
        $scope.theme = constant.THEME;

        $scope.delete = function() {
          $scope.output = $scope.output.slice(0, - 1);
        }

        $scope.clear = function() {
          $scope.output = '';
        }

        $scope.addNumber = function(number) {
          if ($scope.output.length < $scope.limit) $scope.output += number;
        }

        // Keyboard listener
        $(document).keydown(function(e) {
          var charCode = (e.which) ? e.which : e.keyCode;
          charCode = (96 <= charCode && charCode <= 105)? charCode-48 : charCode;

          if ((charCode >= 48 && charCode <= 57) || (charCode >= 96 && charCode <= 105)) { //0-9 only
            $scope.$apply($scope.addNumber(String.fromCharCode(charCode)));
          } else if (charCode == 8){// key:Backspace
            $scope.$apply($scope.delete());
          }
        })
        // Unbind the listener
        $scope.$on('$destroy', function() {
          console.log('Unbind the numpad keyboard');
          $(document).unbind('keydown');
        })
      }]
    }
  })

  .directive('lockscreen', function() {
    return {
      restrict: 'E',
      scope: {
        code: '=',
        onSuccess: '&'
      },
      template: '<ion-header-bar class="bar-assertive">' +
                  '<h1 class="title">Enter Passcode</h1>' +
                '</ion-header-bar>' +
                '<ion-content style="background: white">' +
                  '<passcode value="data.passcode" on-fill="login(passcode)" on-shake="data.shake" limit="code.length"></passcode>' +
                  '<numpad output="data.passcode" limit="code.length"></numpad>' +
                '</ion-content>',
      controller: ['$scope', '$timeout', '$cordovaVibration', function($scope, $timeout, $cordovaVibration) {
        $scope.data = {};
        $scope.data.passcode = '';
        $scope.data.shake = false;
        $scope.data.isLoginFailed = false;

        $scope.login = function(passcode) {
          if (passcode.toString() == $scope.code) {
            // Correct passcode
            $scope.onSuccess();
          } else {
            // Vibrate 100ms
            if (!angular.isUndefined(window.cordova)) $cordovaVibration.vibrate(100);

            $scope.data.isLoginFailed = true;// display the error message
            $scope.data.shake = !$scope.data.shake;// shake the passcode box

            $timeout(function() {
              $scope.$apply(function(){
                $scope.data.passcode = '';// empty the passcode
                $scope.data.isLoginFailed = false;// remove the error message
              })}, 1000);// after 1 sec
          }
        }
      }]
    }
  })

  .service('Lockscreen', function($q, $ionicModal, $rootScope) {
    var self = this;

    var template = '<ion-modal-view class="lock-modal">' + 
                      '<lockscreen code="correctPasscode" on-success="closeModal()"></lockscreen>' + 
                    '</ion-modal-view>';

    this.open = function(passcode) {
      var deferred = $q.defer();
      var scope = $rootScope.$new(true);
      scope.correctPasscode = passcode;

      scope.modal = $ionicModal.fromTemplate(template, {
        scope: scope,
        animation: 'slide-in-up',
        backdropClickToClose: false
      });

      scope.modal.show();

      scope.closeModal = function() {
        scope.modal.hide();
        deferred.resolve();
      }

      return deferred.promise;
    }
  })
