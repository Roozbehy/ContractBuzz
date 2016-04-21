// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
var app = angular.module('app', ['ionic', 'ngCordova', 'app.controllers', 'app.routes', 'app.services', 'app.directives', 'app.contstore', 'angularMoment']);
angular.module('app.controllers', []);


app.controller('ListCtrl', function ($scope, $cordovaLocalNotification, ContStore, $cordovaCalendar) {
    $scope.conts = ContStore.list();
    $scope.expired = ContStore.listExpired();

    $scope.listTypes = function () {
        for (var i = 0; i < $scope.conts.length; i++) {
            console.log("type of cont: " + i);
            console.log(typeof ($scope.conts[i]));
            console.log("Contents of cont " + i);
            console.log(($scope.conts[i]));
            console.log("type of ExpDate for cont " + i);
            console.log(typeof ($scope.conts[i].ExpDate));
            console.log("Content of ExpDate for cont " + i);
            console.log($scope.conts[i].ExpDate);
        }
    };

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

    $scope.isExpired = function (cont) {
        var now = new Date();
        return (cont.ExpDate.getTime() < now.getTime());
    };

    $scope.isDeleted = function (cont) {
        return cont.deleted;
    };

    $scope.cancelNotif = function (contID) {
        if (ContStore.get(contID).RemDate) {
            console.log("There's a notification to be canceled");
            var contIDInt = parseInt(contID);
            $cordovaLocalNotification.cancel(contIDInt, function () {
                alert("notification cancelled");
            });
        }
    };

    $scope.isScheduled = function () {
        $cordovaLocalNotification.isScheduled("1234").then(function (isScheduled) {
            alert("Notification 1234 Scheduled: " + isScheduled);
        });
    };

    $scope.deleteCalEvent = function (contID) {
        if (ContStore.get(contID).RemDate) {
            var contIDInt = parseInt(contID);
            var companyName = ContStore.get(contIDInt).company;
            var newTitle = 'Reminder for ' + companyName;
            var RemDate = ContStore.get(contIDInt).RemDate;
            var ExpDate = ContStore.get(contIDInt).ExpDate;

            $cordovaCalendar.deleteEvent({
                newTitle: newTitle,
                startDate: RemDate,
                endDate: ExpDate
            }).then(function (result) {
                console.log("Inside calendar event delete callback. below is result:");
                console.log(result);
            }, function (err) {
                console.log("Inside calendar event delete callback. below is error:");
                console.log(err);
            });
        }

    };

    $scope.remove = function (contID) {
        var contIDInt = parseInt(contID);
        console.log('Attempting to cancel notification...');
        $scope.cancelNotif(contIDInt);
        console.log('Attempting to delete calendar event...');
        $scope.deleteCalEvent(contID);
        console.log('Attempting to delete contract...');
        ContStore.remove(contIDInt);
    };

});

app.controller('openCtrl', function ($scope, $state, $cordovaDatePicker, $cordovaLocalNotification, ContStore, $cordovaCalendar, $ionicActionSheet, ImageService, FileService, $cordovaDevice, $cordovaFile) {
    $scope.conts = ContStore.list();
    $scope.people = ContStore.getPeople();
    $scope.cont = angular.copy(ContStore.get(parseInt($state.params.contID)));
    console.log("top of openCtrl, type of ExpDate:");
    console.log(typeof $scope.cont.ExpDate);
    $scope.images = FileService.images();

    $scope.openTypes = function () {
        console.log("For loop for conts: ");
        for (var i = 0; i < $scope.conts.length; i++) {
            console.log("type of cont: " + i);
            console.log(typeof ($scope.conts[i]));
            console.log("Contents of cont " + i);
            console.log(($scope.conts[i]));
            console.log("type of ExpDate for cont " + i);
            console.log(typeof ($scope.conts[i].ExpDate));
            console.log("Content of ExpDate for cont " + i);
            console.log($scope.conts[i].ExpDate);
        }
        console.log("For loop finished. details of $scope.cont: ");
        console.log("type of $scope.cont:");
        console.log(typeof ($scope.cont));
        console.log("Contents of $scope.cont");
        console.log($scope.cont);
        console.log("type of ExpDate for $scope.cont");
        console.log(typeof ($scope.cont.ExpDate));
        console.log("Content of ExpDate for $scope.cont");
        console.log($scope.cont.ExpDate);
    };

    $scope.urlForImage = function (imageName) {
        var trueOrigin = cordova.file.dataDirectory + imageName;
        console.log(trueOrigin);
        return trueOrigin;
    };

    $scope.addMedia = function (contID) {
        $scope.hideSheet = $ionicActionSheet.show({
            buttons: [
                {text: 'Take photo'},
                {text: 'Photo from library'}
            ],
            titleText: 'Add images',
            cancelText: 'Cancel',
            buttonClicked: function (index) {
                $scope.addImage(index, contID);
            }
        });
    };

    $scope.addImage = function (type, contID) {
        $scope.hideSheet();
        ImageService.handleMediaDialog(type, contID).then(function () {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });
    };

    $scope.showDatePicker = function (field) {

        if (field == 'expiry') {

            $cordovaDatePicker.show({
                date: $scope.cont.ExpDate ? new Date($scope.cont.ExpDate) : new Date(),
                mode: 'date',
                allowOldDates: false
            }).then(function (success) {
                if (success) {
                    console.log("type of success:");
                    console.log(typeof(success));
                    console.log("DatePicket date success. Type below:");
                    console.log(typeof (success));
                    console.log(success);
                    $scope.cont.ExpDate = success;
                    $scope.cont.stringExp = $scope.cont.ExpDate.toLocaleDateString();
                }

            }, function (error) {
                console.log(error);
            })
        }

        if (field == 'remind') {

            $cordovaDatePicker.show({
                date: $scope.cont.RemDate ? new Date($scope.cont.RemDate) : new Date(),
                mode: 'date',
                allowOldDates: false
            }).then(function (success) {
                console.log(success);
                if (success) {
                    $scope.cont.RemDate = success;
                    $scope.cont.stringRem = $scope.cont.RemDate.toLocaleDateString();
                }
            }, function (error) {
                console.log(error);
            })
        }

        if (field == 'time') {

            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'time'
            }).then(function (success) {
                if (success) {
                    $scope.cont.RemDate.setHours(success.getHours());
                    $scope.cont.RemDate.setMinutes(success.getMinutes());
                    $scope.cont.RemDate.setSeconds(success.getSeconds());
                    var hours = $scope.cont.RemDate.getHours();
                    var minutes = $scope.cont.RemDate.getMinutes();

                    var ampm = (hours < 12) ? 'AM' : 'PM';
                    if (hours > 12) {
                        hours -= 12;
                    }
                    if (minutes > 9) {
                        $scope.cont.stringTime = hours + ':' + minutes + ' ' + ampm;
                    } else {
                        $scope.cont.stringTime = hours + ':0' + minutes + ' ' + ampm;
                    }
                }
            }, function (error) {
                console.log(error);
            })
        }
    };


    $scope.updateNotif = function (contID) {

        var intID = parseInt(contID);
        $cordovaLocalNotification.cancel(intID, function () {
            console.log("notification cancelled");
        });

        if ($scope.cont.RemDate != undefined) {
            var alarmTime = new Date($scope.cont.RemDate);
            $cordovaLocalNotification.schedule({
                id: intID,
                title: $scope.cont.company ? $scope.cont.company : 'no company',
                at: alarmTime
            }).then(function (success) {
                console.log("Notification re-created. below is success:");
                console.log(success);
            }, function (error) {
                console.log("Notification re-creation failed. below is error:");
                console.log(error);
            });

        }
        /*
         if ($scope.cont.RemDate != undefined) {
         var alarmTime = new Date($scope.cont.RemDate);
         var intID = parseInt(contID);
         console.log("inside updateNotif, alarmTime: ");
         console.log(alarmTime);
         $cordovaLocalNotification.update({
         id: intID,
         title: 'Contract Reminder',
         description: $scope.cont.company,
         at: alarmTime,
         json: { updated: true }
         }).then(function (result) {
         console.log("Notif updated");
         })
         }
         */
    };


    $scope.deleteCalEvent = function (contID) {
        if (ContStore.get(contID).RemDate) {
            var companyName = ContStore.get(contID).company;
            var newTitle = 'Reminder for ' + companyName;
            var RemDate = ContStore.get(contID).RemDate;
            var ExpDate = ContStore.get(contID).ExpDate;

            $cordovaCalendar.deleteEvent({
                newTitle: newTitle,
                startDate: RemDate,
                endDate: ExpDate
            }).then(function (result) {
                console.log('inside delete calendarEvent result');
                console.log(result);
            }, function (err) {
                console.log('inside delete calendarEvent error');
                console.log(err);
            });
        }

    };

    $scope.createCalendarEvent = function () {
        var eventTitle = 'Reminder for ' + $scope.cont.company;
        $cordovaCalendar.createEvent({
            title: eventTitle,
            notes: 'Open ContractBuzz for details',
            startDate: $scope.cont.RemDate,
            endDate: $scope.cont.ExpDate
        }).then(function (result) {
            console.log("Inside create calendar result callback, below is result");
            console.log(result);
        }, function (err) {
            console.error("Inside create calendar error callback, below is error");
            console.error(err);
        });
    };


    $scope.modifyCalendarEvent = function () {

        $scope.deleteCalEvent(parseInt($state.params.contID));
        $scope.createCalendarEvent();
    };

    $scope.save = function () {
        if ($scope.cont.RemDate) {
            console.log("Attempting to modify calendar event:");
            $scope.modifyCalendarEvent();
        }
        console.log('Cont ID:');
        console.log($scope.cont.id);
        console.log('Cont ExpDate type');
        console.log(typeof ($scope.cont.ExpDate));
        console.log('type of state params id:');
        console.log(typeof($scope.cont.id));
        console.log('Type of ContIDint:');
        console.log('Cont ID:');
        //  ContStore.addPerson($scope.cont.person);
        if ($scope.cont.RemDate) {
            $scope.updateNotif(parseInt($state.params.contID));
        }
        ContStore.update($scope.cont);
        ContStore.sort();
        $state.go('tabsController.timeline');
    };

});

app.controller('addCtrl', function ($scope, $state, $cordovaDevice, $cordovaFile, $ionicPlatform, $ionicActionSheet, $cordovaDatePicker, $cordovaLocalNotification, $ionicPopup, ImageService, FileService, ContStore, $cordovaCalendar) {
    // add to args : ImageService, FileService,


    $scope.cont = {
        id: parseInt(new Date().getTime().toString()),
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
                mode: 'date',
                allowOldDates: false
            }).then(function (success) {
                console.log("DatePicker expiry, success below:");
                console.log(success);
                console.log("DatePicker success type:");
                console.log(typeof (success));

                if (success) {
                    $scope.cont.ExpDate = success;
                    console.log("success assigned to ExpDate, type of ExpDate:");
                    console.log(typeof ($scope.cont.ExpDate));
                    console.log('type of date:');
                    console.log(typeof (new Date($scope.cont.ExpDate)));
                    console.log('printing date:');
                    console.log(new Date($scope.cont.ExpDate));
                    $scope.cont.stringExp = $scope.cont.ExpDate.toLocaleDateString();
                }
            }, function (error) {
                console.log(error);
            })
        }

        if (field == 'remind') {

            $cordovaDatePicker.show({
                date: $scope.cont.RemDate ? new Date($scope.cont.RemDate) : new Date(),
                mode: 'date',
                allowOldDates: false
            }).then(function (success) {
                console.log("DatePicker remind, success below:");
                console.log(success);
                if (success) {
                    $scope.cont.RemDate = success;
                    $scope.cont.stringRem = $scope.cont.RemDate.toLocaleDateString();
                }
            }, function (error) {
                console.log(error);
            })
        }
        if (field == 'time') {

            $cordovaDatePicker.show({
                date: new Date(),
                mode: 'time'
            }).then(function (success) {
                if (success) {
                    $scope.cont.RemDate.setHours(success.getHours());
                    $scope.cont.RemDate.setMinutes(success.getMinutes());
                    $scope.cont.RemDate.setSeconds(success.getSeconds());
                    var hours = $scope.cont.RemDate.getHours();
                    var minutes = $scope.cont.RemDate.getMinutes();
                    var ampm = (hours < 12) ? 'AM' : 'PM';
                    if (hours > 12) {
                        hours -= 12;
                    }
                    if (minutes > 9) {
                        $scope.cont.stringTime = hours + ':' + minutes + ' ' + ampm;
                    } else {
                        $scope.cont.stringTime = hours + ':0' + minutes + ' ' + ampm;
                    }
                }
            }, function (error) {
                console.log(error);
            })
        }
    };

    $scope.setNotif = function (contID) {
        if ($scope.cont.RemDate != undefined) {
            var alarmTime = new Date($scope.cont.RemDate);
            var intID = parseInt(contID);
            $cordovaLocalNotification.schedule({
                id: intID,
                title: $scope.cont.company ? $scope.cont.company : 'no company',
                at: alarmTime
            }).then(function (success) {
                console.log("Inside LocalNotification success callback. below is succss:");
                console.log(success);
            }, function (error) {
                console.log("Inside LocalNotification error callback. below is error:");
                console.log(error);
            })
        }
    };

    $scope.createCalendarEvent = function () {
        var eventTitle = 'Reminder for ' + $scope.cont.company;
        $cordovaCalendar.createEvent({
            title: eventTitle,
            notes: 'Open ContractBuzz for details',
            startDate: $scope.cont.RemDate,
            endDate: $scope.cont.ExpDate
        }).then(function (result) {
            console.log("Inside create calendar event call back. result: " + result);
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
                {text: 'Cancel'},
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

    $scope.urlForImage = function (imageName) {
        var trueOrigin = cordova.file.dataDirectory + imageName;
        return trueOrigin;
    };

    $scope.addMedia = function (contID) {
        $scope.hideSheet = $ionicActionSheet.show({
            buttons: [
                {text: 'Take photo'},
                {text: 'Photo from library'}
            ],
            titleText: 'Add images',
            cancelText: 'Cancel',
            buttonClicked: function (index) {
                $scope.addImage(index, contID);
            }
        });
    };

    $scope.addImage = function (type, contID) {
        $scope.hideSheet();
        ImageService.handleMediaDialog(type, contID).then(function () {
            if (!$scope.$$phase) {
                $scope.$apply();
            }
        });
    };


    $scope.save = function () {
        console.log("created a copy");
        ContStore.create($scope.cont);
        console.log("added the contract");
        var contIDInt = parseInt($scope.cont.id);
        if ($scope.cont.RemDate) {
            $scope.setNotif(contIDInt);
        }

        console.log("set the notif");
        if ($scope.cont.RemDate) {
            $scope.createCalendarEvent();
        }

        console.log("calendar event created");
        ContStore.sort();
        console.log("sort done");
        $state.go('tabsController.timeline');
        console.log("changed state");
    };

});

app.controller('peopleCtrl', function ($scope, $ionicPopup, ContStore) {
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
                {text: 'Cancel'},
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

    $scope.getInitials = function (person) {
        var initials = person.match(/\b(\w)/g);
        return initials.join('').substr(0, 2);
    }

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

    $scope.restoreConts = function () {
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

    $ionicPlatform.on('resume', function () {
        ContStore.refreshLists();
    });
});
