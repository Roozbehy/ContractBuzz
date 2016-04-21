angular.module('app.contstore', [])

    .factory('ContStore', function () {


        var conts = angular.fromJson(window.localStorage['conts'] || '[]');
        var deletedConts = angular.fromJson(window.localStorage['deletedConts'] || '[]');
        var people = angular.fromJson(window.localStorage['people'] || '[]');
        var expiredConts = angular.fromJson(window.localStorage['expiredConts'] || '[]');
        if (!people[0]) {
            people.push('Roozi');
        }
        

        function persist() {
            window.localStorage['conts'] = angular.toJson(conts);
            window.localStorage['people'] = angular.toJson(people);
            window.localStorage['deletedConts'] = angular.toJson(deletedConts);
            window.localStorage['expiredConts'] = angular.toJson(expiredConts);
        }

        function existsPerson(name) {
            for (var i = 0; i < people.length; i++) {
                if (people[i] === name) {
                    return true;
                }
            }
            return false;
        }

        return {

            list: function () {

                for (var i = 0; i < conts.length; i++) {
                    conts[i].ExpDate = new Date(conts[i].ExpDate);
                    conts[i].RemDate = new Date(conts[i].RemDate);
                }

                return conts;
            },

            listExpired: function () {
                for (var i = 0; i < expiredConts.length; i++) {
                    expiredConts[i].ExpDate = new Date(expiredConts[i].ExpDate);
                    expiredConts[i].RemDate = new Date(expiredConts[i].RemDate);
                }

                return expiredConts;
            },

            sort: function () {
                if (conts.length > 1) {

                    conts.sort(function (a, b) {
                        if (a.ExpDate.getTime() < b.ExpDate.getTime())
                            return -1;
                        else if (a.ExpDate.getTime() > b.ExpDate.getTime())
                            return 1;
                        else
                            return 0;
                    });
                }
                if (expiredConts.length > 1) {

                    expiredConts.sort(function (a, b) {
                        if (a.ExpDate.getTime() < b.ExpDate.getTime())
                            return -1;
                        else if (a.ExpDate.getTime() > b.ExpDate.getTime())
                            return 1;
                        else
                            return 0;
                    });

                }
            },

            get: function (contID) {
                for (var i = 0; i < conts.length; i++) {
                    if (conts[i].id == contID) {
                        return conts[i];
                    }
                }

                for (var j = 0; j < expiredConts.length; j++) {
                    if (expiredConts[j].id === contID) {
                        return expiredConts[j];
                    }
                }
                return undefined;
            },

            create: function (cont) {
                var now = new Date();
                if (cont.ExpDate.getTime() < now.getTime()) {
                    expiredConts.push(cont);
                } else {
                    conts.push(cont);
                }
                persist();
            },

            update: function (cont) {
                for (var i = 0; i < conts.length; i++) {
                    if (conts[i].id == cont.id) {
                        var now = new Date();
                        console.log("inside contstore update: typeof ExpDate");
                        console.log(typeof(cont.ExpDate));
                        if (cont.ExpDate.getTime() < now.getTime()) {
                            expiredConts.push(cont);
                            conts.splice(i, 1);
                            persist();
                            return;
                        } else {
                            conts[i] = cont;
                            console.log("Inside contstore update: conts[i] = cont");
                            persist();
                            return;
                        }
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

                for (var j = 0; j < expiredConts.length; j++) {
                    if (expiredConts[j].id === contID) {
                        deletedConts.push(expiredConts[j]);
                        expiredConts.splice(j, 1);
                        persist();
                        return;
                    }
                }
            },

            restoreDeletedConts: function () {
                var now = new Date();
                for (var i = 0; i < deletedConts.length; i++) {
                    if (deletedConts[i].ExpDate.getTime() > now.getTime()) {
                        conts.push(deletedConts[i]);
                    } else {
                        expiredConts.push(deletedConts[i]);
                    }
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

            getPersonConts: function (person) {
                var personConts = [];
                for (var i = 0; i < conts.length; i++) {
                    if (conts[i].person === person) {
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
                    if (conts[i].person == person) {
                        deletedConts.push(conts[i]);
                        conts.splice(i, 1);
                    }
                    persist();
                }

                for (var j = 0; j < people.length; j++) {
                    if (people[j] === person) {
                        people.splice(j, 1);
                        persist();
                        return;
                    }
                }
            },

            refreshLists: function () {
                var now = new Date();
                for (var i = 0; i < conts.length; i++) {
                    if (conts[i].ExpDate.getTime() < now.getTime()) {
                        expiredConts.push(conts[i]);
                        conts.splice(i, 1);
                    }
                    persist();
                }
            }
        };
    });
