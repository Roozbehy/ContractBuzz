// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('app', ['ionic', 'ngCordova', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'app.contstore', 'angularMoment','ionicLetterAvatarSelector']);
angular.module('app.controllers', []);


app.controller('ListCtrl', function ($scope, $cordovaLocalNotification, ContStore, $cordovaCalendar) {

    $scope.conts = ContStore.list();
    $scope.expired = ContStore.listExpired();


    $scope.toggleCont = function (cont) {
        if ($scope.isContShown(cont)) {
            $scope.shownCont = null;

        } else {
            $scope.shownCont = cont;
        }
    };
    $scope.isContShown = function (cont) {
        return $scope.shownCont === cont;
    };
    $scope.daysLeft = function (date) {
        if (date) {
            var oneDay = 24 * 60 * 60 * 1000;	// hours*minutes*seconds*milliseconds
            var current = new Date();
            var diffDays = Math.ceil((date.getTime() - current.getTime()) / (oneDay));
            return diffDays;
        }

    };

    $scope.isExpired = function (cont){
      var now = new Date();
      return (cont.ExpDate.getTime() < now.getTime());
    };

    $scope.isDeleted = function (cont){
      return cont.deleted;
    };

    $scope.cancelNotif = function (contID) {
      if (ContStore.get(contID).RemDate){
        $cordovaLocalNotification.cancel(contID);
      }

    };

    $scope.isScheduled = function () {
        $cordovaLocalNotification.isScheduled("1234").then(function (isScheduled) {
            alert("Notification 1234 Scheduled: " + isScheduled);
        });
    };

    $scope.deleteCalEvent = function(contID){
      if (ContStore.get(contID).RemDate){
        var companyName = ContStore.get(contID).company;
        var newTitle = 'Reminder for ' + companyName;
        var RemDate = ContStore.get(contID).RemDate;
        $cordovaCalendar.deleteEvent({
        newTitle: newTitle,
        startDate: RemDate,
        endDate: RemDate
      }).then(function (result) {
        console.log(result);
      }, function (err) {
        console.log(err);
      });
    };
    };

    $scope.remove = function (contID) {
        var contIDInt = parseInt(contID);
        //$scope.cancelNotif(contIDInt);
        //$scope.deleteCalEvent(contID);
        ContStore.remove(contID);
    };

});

app.controller('openCtrl', function ($scope, $state, $cordovaDatePicker, $cordovaLocalNotification, ContStore, $cordovaCalendar, $ionicActionSheet, ImageService, FileService, $cordovaDevice, $cordovaFile) {
    $scope.conts = ContStore.list();
    $scope.people = ContStore.getPeople();
    $scope.cont = angular.copy(ContStore.get($state.params.contID));
    $scope.images = FileService.images();

  $scope.urlForImage = function(imageName) {
    var trueOrigin = cordova.file.dataDirectory + imageName;
    return trueOrigin;
  };

  $scope.addMedia = function(contID) {
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take photo' },
        { text: 'Photo from library' }
      ],
      titleText: 'Add images',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.addImage(index, contID);
      }
    });
  };

  $scope.addImage = function(type, contID) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type, contID).then(function() {
      if (!$scope.$$phase)
      {
        $scope.$apply();
      }
    });
  };

    $scope.showDatePicker = function (field) {

        if (field == 'expiry') {

            $cordovaDatePicker.show({
                date: $scope.cont.ExpDate ? new Date($scope.cont.ExpDate) : new Date(),
                mode: 'date'
            }).then(function (success) {
                console.log(success);
                $scope.cont.ExpDate = success;
                $scope.cont.stringExp = $scope.cont.ExpDate.toLocaleDateString();
            }, function (error) {
                console.log(error);
            })
        }

        if (field == 'remind') {

            $cordovaDatePicker.show({
                date: $scope.cont.RemDate ? new Date($scope.cont.RemDate) : new Date(),
                mode: 'date'
            }).then(function (success) {
                console.log(success);
                $scope.cont.RemDate = success;
                $scope.cont.stringRem = $scope.cont.RemDate.toLocaleDateString();
            }, function (error) {
                console.log(error);
            })
        }

        if (field == 'time') {

            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'time'
            }).then(function (success) {
                $scope.cont.RemDate.setHours(success.getHours());
                $scope.cont.RemDate.setMinutes(success.getMinutes());
                $scope.cont.RemDate.setSeconds(success.getSeconds());
                var hours = $scope.cont.RemDate.getHours();
                var minutes = $scope.cont.RemDate.getMinutes();
                var ampm = (hours < 12) ? 'AM' : 'PM';
                if (hours>12) {
                  hours-=12;
                }
                $scope.cont.stringTime = hours + ':' + minutes + ' ' + ampm;
              }, function (error) {
                console.log(error);
            })
        }
    };

    $scope.updateNotif = function (contID) {
        $cordovaLocalNotification.update({
            id: contID,
            title: 'Contract Reminder',
            description: $scope.cont.company,
            at: $scope.cont.RemDate
        }).then(function (success) {
            console.log(success);
        }, function (error) {
            console.log(error);
        })
    };

    $scope.modifyCalendarEvent = function() {
    var currentTitle = 'Reminder for ' + ContStore.get($state.params.contID).company;
    var currentRemDate = ContStore.get($state.params.contID).RemDate;
    var newTitle = 'Reminder for ' + $scope.cont.company;

    $cordovaCalendar.modifyEvent({
    title: currentTitle,
    startDate: currentRemDate,
    endDate: currentRemDate,
    newTitle: newTitle,
    newStartDate: $scope.cont.RemDate,
    newEndDate: $scope.cont.RemDate
  }).then(function (result) {
    console.log(result);
  }, function (err) {
    console.log(err);
  });
};

    $scope.save = function () {
      if ($scope.cont.RemDate){
        $scope.modifyCalendarEvent();
      }
        ContStore.update($scope.cont);
      //  ContStore.addPerson($scope.cont.person);
        var contIDint = parseInt($scope.cont.id);
        console.log(contIDint);
        if ($scope.cont.RemDate){
        $scope.updateNotif(contIDint);
      }
        ContStore.sort();
        $state.go('tabsController.timeline');
    };

});

app.controller('addCtrl', function ($scope, $state, $cordovaDevice, $cordovaFile, $ionicPlatform, $ionicActionSheet,  $cordovaDatePicker, $cordovaLocalNotification, $ionicPopup, ImageService, FileService, ContStore, $cordovaCalendar) {
   // add to args : ImageService, FileService,


    $scope.cont = {
        id: new Date().getTime().toString(),
        ExpDate: '',
        RemDate: '',
        stringExp: '',
        stringRem: '',
        stringTime: '',
        remind: '',
        type: '',
        company: '',
        person: '',
        ref: '',
        contact_number: '',
        email: '',
        notes: '',
        deleted: false
    };
    $scope.people = ContStore.getPeople();


    $scope.showDatePicker = function (field) {

        if (field == 'expiry') {

            $cordovaDatePicker.show({
                date: $scope.cont.ExpDate ? new Date($scope.cont.ExpDate) : new Date(),
                mode: 'date'
            }).then(function (success) {
                console.log(success);
                $scope.cont.ExpDate = success;
                $scope.cont.stringExp = $scope.cont.ExpDate.toLocaleDateString();
            }, function (error) {
                console.log(error);
            })
        }

        if (field == 'remind') {

            $cordovaDatePicker.show({
                date: $scope.cont.RemDate ? new Date($scope.cont.RemDate) : new Date(),
                mode: 'date'
            }).then(function (success) {
                console.log(success);
                $scope.cont.RemDate = success;
                $scope.cont.stringRem = $scope.cont.RemDate.toLocaleDateString();
            }, function (error) {
                console.log(error);
            })
        }
                if (field == 'time') {

                    $cordovaDatePicker.show({
                        date: new Date(),
                        mode: 'time'
                    }).then(function (success) {
                        $scope.cont.RemDate.setHours(success.getHours());
                        $scope.cont.RemDate.setMinutes(success.getMinutes());
                        $scope.cont.RemDate.setSeconds(success.getSeconds());
                        var hours = $scope.cont.RemDate.getHours();
                        var minutes = $scope.cont.RemDate.getMinutes();
                        var ampm = (hours < 12) ? 'AM' : 'PM';
                        if (hours>12) {
                          hours-=12;
                        }
                        $scope.cont.stringTime = hours + ':' + minutes + ' ' + ampm;
                      }, function (error) {
                        console.log(error);
                    })
                }
    };

    $scope.setNotif = function (contID) {
      if ($scope.cont.RemDate!=undefined){
        var alarmTime = $scope.cont.RemDate;
        $cordovaLocalNotification.schedule({
            id: contID,
            title: $scope.cont.company ? $scope.cont.company : 'no company',
            at: alarmTime
        }).then(function (success) {
            console.log(success);
        }, function (error) {
            console.log(error);
        })
    }
  };

  $scope.createCalendarEvent = function() {
      var eventTitle = 'Reminder for ' + $scope.cont.company;
        $cordovaCalendar.createEvent({
            title: eventTitle,
            notes: 'Open ContractBuzz for details',
            startDate: $scope.cont.RemDate,
            endDate: $scope.cont.RemDate
        }).then(function (result) {
            console.log("Event created successfully");
        }, function (err) {
            console.error("There was an error: " + err);
        });
    };

    $scope.showPopup = function () {
        $scope.person = {};
        var peopleSize = ContStore.getPeople().length;
        console.log(peopleSize);



        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="person.name">',
            title: 'Enter person\'s name',
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.person.name) {
                            e.preventDefault();
                        } else {
                            return $scope.person.name;
                        }
                    }
                }
            ]
        });
        myPopup.then(function (res) {
            if (res) {
                ContStore.addPerson(res);
            }
        });
    };

    $scope.images = FileService.images();

  $scope.urlForImage = function(imageName) {
    var trueOrigin = cordova.file.dataDirectory + imageName;
    return trueOrigin;
  };

  $scope.addMedia = function(contID) {
    $scope.hideSheet = $ionicActionSheet.show({
      buttons: [
        { text: 'Take photo' },
        { text: 'Photo from library' }
      ],
      titleText: 'Add images',
      cancelText: 'Cancel',
      buttonClicked: function(index) {
        $scope.addImage(index, contID);
      }
    });
  };

  $scope.addImage = function(type, contID) {
    $scope.hideSheet();
    ImageService.handleMediaDialog(type, contID).then(function() {
      if (!$scope.$$phase)
      {
        $scope.$apply();
      }
    });
  };



    $scope.save = function () {
        console.log("created a copy");
        ContStore.create($scope.cont);
        console.log("added the contract");
        var contIDInt = parseInt($scope.cont.id);
        if ($scope.cont.RemDate){$scope.setNotif(contIDInt);};
        console.log("set the notif");
        if ($scope.cont.RemDate){$scope.createCalendarEvent();};
        console.log("calendar event created");
        ContStore.sort();
        console.log("sort done");
        $state.go('tabsController.timeline');
        console.log("changed state");
    };

});

app.controller('peopleCtrl', function ($scope, $ionicPopup, ContStore, $ionicLetterAvatarSelector) {
    $scope.people = ContStore.getPeople();
    $scope.conts = ContStore.list();
    $scope.shouldShowDelete = false;
    $scope.shouldShowReorder = false;
    $scope.listCanSwipe = true;

    $scope.reorderItem = function (item, fromIndex, toIndex) {
        $scope.people.splice(fromIndex, 1);
        $scope.people.splice(toIndex, 0, item);
    };

    $scope.onItemDelete = function (item) {
        $scope.people.splice($scope.people.indexOf(item), 1);
    };

    $scope.togglePerson = function (person) {
        if ($scope.isPersonShown(person)) {
            $scope.shownPerson = null;

        } else {
            $scope.personConts = ContStore.getPersonConts(person);
            $scope.shownPerson = person;
        }
    };

    $scope.isPersonShown = function (person) {
        return $scope.shownPerson === person;
    };

    $scope.daysLeft = function (date) {
        if (date) {
            var oneDay = 24 * 60 * 60 * 1000;	// hours*minutes*seconds*milliseconds
            var current = new Date();
            var diffDays = Math.ceil((date.getTime() - current.getTime()) / (oneDay));
            return diffDays;
        }

    };

    $scope.showPopup = function () {
        $scope.person = {};

        // An elaborate, custom popup
        var myPopup = $ionicPopup.show({
            template: '<input type="text" ng-model="person.name">',
            title: 'Enter person\'s Name',
            scope: $scope,
            buttons: [
                { text: 'Cancel' },
                {
                    text: '<b>Save</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        if (!$scope.person.name) {

                            e.preventDefault();
                        } else {
                            return $scope.person.name;
                        }
                    }
                },
            ]
        });
        myPopup.then(function (res) {
            if (res) {
                ContStore.addPerson(res);
            }
        });
    };

    /*$scope.removePerson = function (person) {
        ContStore.removePerson(person);
    };*/

    $scope.remove = function (person) {
        var confirmPopup = $ionicPopup.confirm({
            title: 'Are you sure?',
            template: 'All contracts assigned to this person will be permanently deleted'
        });
        confirmPopup.then(function (res) {
            if (res) {
                ContStore.removePerson(person);
            }
        });

    };

});


app.controller('timelineCtrl', function ($scope) {

})

    .controller('linkedinCtrl', function ($scope) {

    })

    .controller('tescoCtrl', function ($scope) {

    });

app.controller('o2Ctrl', function ($scope) {

})

    .controller('lAFitnessCtrl', function ($scope) {

    });

app.controller('addItemCtrl', function ($scope) {

});

app.controller('settingsCtrl', function ($scope, ContStore) {

  $scope.restoreConts = function(){
    ContStore.restoreDeletedConts();
  };

});

app.run(function ($ionicPlatform, ContStore) {
    // cordova.plugins.Keyboard.disableScroll(true);


    $ionicPlatform.ready(function () {
        //  cordova.plugins.Keyboard.disableScroll(true);
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)

        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
              cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
            //cordova.plugins.Keyboard.disableScroll(true);
        }
    });

    $ionicPlatform.on('resume', function(){
      ContStore.refreshLists();
        });
});
