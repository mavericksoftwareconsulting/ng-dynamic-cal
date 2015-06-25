
dynamicCal.directive('calWeek', ['$document', 'calEventHandler', '$timeout', function ($document, calEventHandler, $timeout) {
    return {
        restrict: 'E',
        templateUrl: 'calWeek.html',
        scope: {
            calendar: '=calendar',
            days: '=days',

            onEventClick: '=onEventClick',
            onEventChange: '=onEventChange',
            onTimeSelect: '=onTimeSelect'
        },
        require: ['^calCalendar'],
        link: function (scope, elem, attrs, controller) {
            //console.log("Week");
            scope.start = scope.calendar.viewStart;
            scope.end = scope.calendar.viewEnd;
            scope.cellHeight = controller[0].cellHeight;

            var dif = scope.end - scope.start;
            scope.down = function () {
                scope.end = Math.min(24, scope.end + 1);
                scope.start = scope.end - dif;
            }
            scope.up = function () {
                scope.start = Math.max(0, scope.start - 1);
                scope.end = scope.start + dif;
            }
        }
    }
}]);
