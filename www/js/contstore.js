angular.module('app.contstore', [])

    .factory('ContStore', function () {


        var conts = angular.fromJson(window.localStorage['conts'] || '[]');
        var deletedConts = angular.fromJson(window.localStorage['deletedConts'] || '[]');
        var people = angular.fromJson(window.localStorage['people'] || '[]');
        if (!people[0]){
          people.push('Roozi');
        };

        function persist() {
            window.localStorage['conts'] = angular.toJson(conts);
            window.localStorage['people'] = angular.toJson(people);
            window.localStorage['deletedConts'] = angular.toJson(deletedConts);
        };

        function existsPerson(name) {
            for (var i = 0; i < people.length; i++) {
                if (people[i] === name) {
                    return true;
                }
            }
            return false;
        };

        return {
            list: function () {
                return conts;
            },

            sort: function () {
                conts.sort(function (a, b) {
                    if (a.ExpDate.getTime() < b.ExpDate.getTime())
                        return -1;
                    else if (a.ExpDate.getTime() > b.ExpDate.getTime())
                        return 1;
                    else
                        return 0;
                });
            },

            get: function (contID) {
                for (var i = 0; i < conts.length; i++) {
                    if (conts[i].id === contID) {
                        return conts[i];
                    }
                }
                return undefined;
            },

            create: function (cont) {
                conts.push(cont);
                persist();
            },

            update: function (cont) {
                for (var i = 0; i < conts.length; i++) {
                    if (conts[i].id === cont.id) {
                        conts[i] = cont;
                        persist();
                        return;
                    }
                }
            },

            remove: function (contID) {
                for (var i = 0; i < conts.length; i++) {
                    if (conts[i].id === contID) {
                      deletedConts.push(conts[i]);
                        conts.splice(i, 1);
                        persist();
                        return;
                    }
                }
            },

            restoreDeletedConts: function(){
              for (var i = 0; i < deletedConts.length; i++) {
                conts.push(deletedConts[i]);
              }
              deletedConts = [];
              persist();
            },

            getPeople: function () {
                return people;
            },

            numPeople: function () {
                return people.length;
            },

            getPersonConts: function(person){
                var personConts = [];
                for (var i = 0; i < conts.length; i++) {
                    if (conts[i].person === person){
                        personConts.push(conts[i]);
                    }
                }
                return personConts;
            },

            addPerson: function (person) {
                if (person && !existsPerson(person)) {
                    people.push(person);
                    persist();
                }
            },

            removePerson: function (person) {
              var iteratenum = conts.length;
                for (var i = 0; i < iteratenum; i++) {
                    if (conts[i].person == person){
                      deletedConts.push(conts[i]);
                        conts.splice(i, 1);
                    }
                    persist();
                }

                for (var i = 0; i < people.length; i++) {
                    if (people[i] === person) {
                        people.splice(i, 1);
                        persist();
                        return;
                    }
                }
            },
        };
    });
