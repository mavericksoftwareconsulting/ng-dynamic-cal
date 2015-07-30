var dynamicCal = angular.module("dynamicCal", []);

dynamicCal.directive('calCalendar', ['$document', 'calEventHandler', 'calDayObject', '$timeout', function ($document, calEventHandler, calDayObject, $timeout) {
    return {
        restrict: 'E',
        scope: {
            events: '=?events',
            config: '=?config',
            onViewChange: '=?onViewChange',
            onEventChange: '=?onEventChange',
            onEventClick: '=?onEventClick',
            onTimeSelect: '=?onTimeSelect',
            loading: '=?loading'
        },
        controller: "calCalendarCtrl",
        templateUrl: 'calCalendar.html', //App/Shared/mavCalendar/calCalendar.html',
        link: function (scope, elem, attrs, controller) {














        }
    }
}]);




dynamicCal.controller('calCalendarCtrl', ["$scope", '$timeout', 'calDayObject', function ($scope, $timeout, calDayObject) {
    if ($scope.config == null) $scope.config = {};
    this.calendar = $scope.config;
    this.onEventChange = $scope.onEventChange;
    this.eventDateChange = function (event) {
        var weeks = $scope.view.weeks;
        if (weeks != undefined) {
            for (var i = 0; i < weeks.length; i++) {
                for (var j = 0; j < weeks[i].length; j++) {
                    weeks[i][j].removeEvent(event);
                    if ($scope.isSameDay(weeks[i][j].date, event.start)) {
                        weeks[i][j].addEvent(event);
                    }
                }
            }
        }
    }



    $scope.count = 0;
    $scope.$watchCollection('events', function (newVal, oldVal) {
        $scope.updateEvents($scope.count);
    }, true);


    $scope.isDate = function (date) {
        return date.constructor === Date;
    }
    $scope.dayEvents = [];
    $scope.lastLength = 0;


    $scope.isSameDay = function (date1, date2) {
        return date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear();
    }

    $scope.updateEvents = function (c) {

        if ($scope.events != undefined) {
            var eventCopy = [].concat($scope.events);

            eventCopy.sort(function (a, b) {
                var startDif = a.start.getTime() - b.start.getTime();
                if (startDif != 0) return startDif;
                else return a.end.getTime() - b.end.getTime();
            });


            var eventIndex = 0;
            var weeks = $scope.view.weeks;
            if (weeks != undefined) {
                for (var i = 0; i < weeks.length; i++) {
                    for (var j = 0; j < weeks[i].length; j++) {
                        if (!weeks[i][j].isPlaceholder) {
                            var events = [];
                            var nextDay = new Date(weeks[i][j].date.getFullYear(), weeks[i][j].date.getMonth(), weeks[i][j].date.getDate() + 1);
                            while (eventIndex < eventCopy.length && eventCopy[eventIndex].start.getTime() < nextDay.getTime()) {
                                if ($scope.isSameDay(eventCopy[eventIndex].start, weeks[i][j].date)) {
                                    events.push(eventCopy[eventIndex]);
                                }
                                eventIndex++;
                            }
                            weeks[i][j].setEvents(events);
                        }
                    }
                }
            }
        }
    }


    var today = new Date();
    today.setHours(0, 0, 0, 0);
    $scope.today = today;

    var config = $scope.config != null ? $scope.config : {};
    if (config.editStep == undefined) config.editStep = .5;
    if (config.viewStart == undefined) config.viewStart = 0;
    if (config.viewEnd == undefined) config.viewEnd = 24;
    if (config.durration == undefined) config.durration = "week";
    if (config.type == undefined) config.type = "schedule";
    if (config.canChangeType == undefined) config.canChangeType = true;
    if (config.date == undefined) config.date = new Date(today);
    if (config.showHead == undefined) config.showHead = true;
    if (config.cellHeight == undefined) config.cellHeight = 20;
    //if (config. == undefined) config. = ;

    config.title = "";
    config.startDate = new Date(today);
    config.endDate = new Date(today);
    config.today = today;
    config.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    config.daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    config.prev = function () {
        this.moveView(-1);
    };
    config.next = function () {
        this.moveView(1);
    };
    config.goToToday = function () {
        console.log(this.today);
        this.changeDate(this.today);
    };
    config.changeDate = function (date) {
        this.date = new Date(date);
        this.load();
    };
    config.moveView = function (multilpier) {
        switch (this.durration) {
            case "month":
                this.date.setDate(1);
                this.date.setMonth(this.date.getMonth() + (1 * multilpier));
                break;
            case "day":
                this.date.setDate(this.date.getDate() + (1 * multilpier));
                break;
            default:
                this.date.setDate(this.date.getDate() + (7 * multilpier));
        }
        this.load();
    };
    config.load = function (durration) {
        if (durration != undefined) this.durration = durration;
        this.days = [];
        this.date.setHours(0, 0, 0, 0);
        var startDate = new Date(this.date);
        var endDate = new Date(this.date);
        switch (this.durration) {
            case "month":
                startDate.setDate(1);
                endDate.setMonth(endDate.getMonth() + 1);
                endDate.setDate(0);
                this.title = this.months[startDate.getMonth()] + " " + startDate.getFullYear();
                break;
            case "day":
                this.title = (startDate.getTime() == this.today.getTime() ? "Today" : this.daysOfWeek[startDate.getDay()] + ", " + this.months[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getFullYear())
                break;
            default:
                startDate.setDate(startDate.getDate() - startDate.getDay());
                endDate.setDate(endDate.getDate() + 6 - endDate.getDay());
                this.title = this.months[startDate.getMonth()] + " " + startDate.getDate() + ", " + startDate.getFullYear() + " - " + this.months[endDate.getMonth()] + " " + endDate.getDate() + ", " + endDate.getFullYear()
        }
        var oldStartDate = this.startDate;
        var oldEndDate = this.endDate;

        this.startDate = startDate;
        this.endDate = endDate;


        console.log("load", startDate, endDate);

        var beginning = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - startDate.getDay());
        var end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + (6 - endDate.getDay()))
        var numberOfWeeks = Math.ceil((((end.getTime() - beginning.getTime()) / 1000 / 60 / 60 / 24) + 1) / 7);

        if (numberOfWeeks == 1) {
            beginning = new Date(startDate);
            end = new Date(endDate);
        }


        weekArray = new Array(numberOfWeeks);
        var cur = new Date(beginning);
        for (var i = 0; i < numberOfWeeks; i++) {
            weekArray[i] = new Array();
            for (var j = 0; j < 7 && cur <= end; j++) {
                weekArray[i].push(new calDayObject(cur, !(cur >= startDate && cur <= endDate)));
                //if (cur >= startDate && cur <= endDate) {
                //    weekArray[i].push({ date: new Date(cur), events: [] });
                //}
                //else weekArray[i].push({ date: -cur.getDate(), events: [] });
                cur.setDate(cur.getDate() + 1);
            }
        }
        this.weeks = weekArray;
        if (numberOfWeeks == this.startDate.getMonth()) {
            window.lastWeeks = window.weeks;
            window.weeks = JSON.stringify(weekArray);
            console.log("=====", weekArray);//startDate, endDate);
        }

        $scope.updateEvents(-1);

        if (oldEndDate.getTime() != this.endDate.getTime() || oldStartDate.getTime() != this.startDate.getTime()) {
            if ($scope.onViewChange != undefined && $scope.onViewChange.constructor == Function) {
                //console.log("TEST", this.endDate, this.startDate);
                var _this = this;
                $timeout(function () {
                    $scope.onViewChange(_this.startDate, _this.endDate);
                }, 0);
            }
        }
        $timeout(function () { $scope.$apply(); });
    };

    $scope.view = config;

    $scope.$watch('[view.viewStart, view.viewEnd, view.durration,view.date.getTime()]', function (n, o) {
        console.log("duration changed", n, o);
        $scope.view.load($scope.view.durration);
    });
    $scope.view.load();

}]);