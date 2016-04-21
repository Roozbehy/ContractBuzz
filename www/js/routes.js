angular.module('app.routes', [])

.config(function($stateProvider, $urlRouterProvider) {

  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider


    .state('tabsController', {
      url: '',
      abstract:true,
      templateUrl: 'templates/tabsController.html'
    })


    .state('tabsController.timeline', {
      url: '/timeline',
      views: {
        'tab1': {
          templateUrl: 'templates/timeline.html',
          controller: 'timelineCtrl'
        }
      }
    })


    .state('tabsController.open', {
      url: '/open/:contID',
      views: {
        'tab1': {
          templateUrl: 'templates/add.html',
          controller: 'openCtrl'
        }
      }
    })





    .state('tabsController.people', {
      url: '/people',
      views: {
        'tab3': {
          templateUrl: 'templates/people.html',
          controller: 'peopleCtrl'
        }
      }
    })


    .state('tabsController.add', {
      cache: false,
      url: '/add',
      views: {
        'tab2': {
          templateUrl: 'templates/add.html',
          controller: 'addCtrl'
        }
      }
    })



    .state('tabsController.settings', {
      url: '/settings',
      views: {
        'tab4': {
          templateUrl: 'templates/settings.html',
          controller: 'settingsCtrl'
        }
      }
    })


    ;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/timeline');

});
