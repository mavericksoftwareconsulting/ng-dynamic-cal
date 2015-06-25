
dynamicCal.directive('calDay', ['$document', 'calEventHandler', function ($document, calEventHandler) {
    return {
        restrict: 'E',
        templateUrl: 'calDay.html',
        //template: ' <div class="cal-day-header">{{ date.getDate() }} - {{events.length}} Events</div> \
        //<div class="cal-container"> \
        //    <div class="cal-calendar-grid"> \
        //        <div ng-repeat="i in [] | range:calendar.viewStart:calendar.viewEnd:.5" ng-class="cal-hourMark : i % 1 == 0, cal-halfHourMark : i % 1 != 0"></div> \
        //    </div> \
        //    <cal-event ng-repeat="event in events" event="event.event" calendar="calendar" on-event-change="onEventChange" on-event-click="onEventClick" event-left="event.location.left" event-width="event.location.width"></cal-event> \
        //</div> \
        //',
        require: ['^calCalendar'],
        scope: {
            calendar: '=calendar',
            //date: '=date',
            //events: '=events',
            day: '=day',
            onEventClick: '=onEventClick',
            onEventChange: '=onEventChange',
            onTimeSelect: '=onTimeSelect',
            startTime: '=startTime',
            endTime: '=endTime'
        },
        controller: 'calDayCtrl',
        link: function (scope, elem, attrs, controller) {
            //console.log("Day");
            var today = new Date(); today.setHours(0, 0, 0, 0);
            if (scope.day.date < today) elem.addClass("cal-past");
            if (scope.day.date.getTime() == today.getTime()) elem.addClass("cal-today");

            scope.cellHeight = controller[0].cellHeight;
            scope.fullDaysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            scope.daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
            var $_ = angular.element;
            function getOverlay() {
                var allLabels = elem.find('label');
                for (var i = 0 ; i < allLabels.length; i++) {
                    if(angular.element(allLabels[i]).hasClass("cal-overlay")) return angular.element(allLabels[i]);
                }
                var allDivs = elem.find('div');
                for (var i = 0 ; i < allDivs.length; i++) {
                    if ($_(allDivs[i]).hasClass("cal-container")) {
                        var overlay = $_('<label class="cal-overlay" ></label>');
                        $_(allDivs[i]).prepend(overlay);
                        return overlay;
                    }
                }
                return [];
            }


            var startY, startTop, startBottom, overlay;

            function removeOverlay() {
                if (overlay == undefined || overlay.length == 0) overlay = getOverlay()
                overlay.remove();
            }



            function mouseout(e) {
                // Get Container where mouse moved to
                var targetContainer = $_(e.relatedTarget);
                for (var depth = 0; depth < 10 && !targetContainer.hasClass("cal-container") ; depth++) {
                    targetContainer = targetContainer.parent();
                }
                // Get Initial container
                var overlayContainer = overlay.parent();
                
                // If mouse moved out of initial container remove overlay
                if (!overlayContainer[0].isSameNode(targetContainer[0])) {
                    removeOverlay();
                    elem.off('mouseup', mouseup);
                    elem.off('mousemove', mousemove);
                    elem.off('mouseout', mouseout);
                }
            }

            elem.on('mousedown', function (e) { removeOverlay();  } );

            var startPageTop, startPageBottom, cellHeight;
            elem.on('mousedown', function (e) {
                $document.off('mousedown', deleteOverlay);
                if (scope.onTimeSelect != undefined && scope.onTimeSelect.constructor == Function) {
                    var target = $_(e.target);
                    if (target.hasClass('cal-hourMark') || target.hasClass('cal-halfHourMark')) {

                        startY = e.pageY;
                        startPageTop = startY - e.offsetY;
                        startPageBottom = startPageTop + e.target.offsetHeight;
                        startTop = e.target.offsetTop;
                        startBottom = startTop + e.target.offsetHeight;
                        cellHeight = e.target.offsetHeight;

                        overlay = getOverlay();
                        overlay.css('top', e.target.offsetTop + "px").css('height', e.target.offsetHeight + "px");


                        // Set up events
                        elem.on('mouseup', mouseup);
                        elem.on('mousemove', mousemove);
                        elem.on('mouseout', mouseout);
                    }
                }
            });

            function deleteOverlay() { 
                removeOverlay();
                $document.off('mousedown', deleteOverlay);
            }

            function mousemove(e) {
                var overlayHeight, overlayTop;
                if (e.pageY >= startPageTop) {
                    overlayHeight = Math.ceil((e.pageY - startPageTop) / scope.cellHeight) * scope.cellHeight;
                    overlayTop = startTop;
                }
                else {
                    overlayHeight = Math.ceil((startPageBottom - e.pageY) / cellHeight) * cellHeight;
                    overlayTop = startBottom - overlayHeight;
                }
                overlay.css('top', overlayTop + "px").css('height', overlayHeight + "px");
            }


            function mouseup(e) {
                var start = (overlay[0].offsetTop / cellHeight / 2) + 5;
                var end = start + (overlay[0].offsetHeight / cellHeight / 2);
                var startDate = new Date(scope.date);
                startDate.setHours(0, 0, 0, 0);
                startDate.setHours(Math.floor(start));
                startDate.setMinutes(start % 1 * 60);
                
                var endDate = new Date(startDate);
                endDate.setHours(Math.floor(end));
                endDate.setMinutes(end % 1 * 60);

                if (scope.onTimeSelect != undefined && scope.onTimeSelect.constructor == Function) {
                    scope.onTimeSelect(startDate, endDate);
                }

                elem.off('mouseup', mouseup);
                elem.off('mousemove', mousemove);
                elem.off('mouseout', mouseout);
                $document.on('mousedown', deleteOverlay);
            }



            scope.$on("CAL-DATE-CHANGE", function () {
                if ($_(elem)[0] == $_(calEventHandler.destDayElem)[0]) {
                    try{
                        calEventHandler.event.start.setDate(scope.date.getDate());
                        calEventHandler.event.start.setMonth(scope.date.getMonth());
                        calEventHandler.event.start.setYear(scope.date.getFullYear());
                        calEventHandler.event.end.setDate(scope.date.getDate());
                        calEventHandler.event.end.setMonth(scope.date.getMonth());
                        calEventHandler.event.end.setYear(scope.date.getFullYear());
                        //calEventHandler.event.date.setDate(scope.date.getDate());
                        //calEventHandler.event.date.setMonth(scope.date.getMonth());
                        //calEventHandler.event.date.setYear(scope.date.getFullYear());
                    }
                    catch (ex) {
                        console.log("Error :(", ex);
                    }



                    var divs = $_(calEventHandler.destDayElem).find('div');
                    for (var i = 0; i < divs.length; i++) {
                        if ($_(divs[i]).hasClass('cal-container')) {
                            $_(divs[i]).append(calEventHandler.eventElem);
                            break;
                        }
                    }
                }
                else if ($_(elem)[0] == $_(calEventHandler.srcDayElem)[0]) {
                }
            });
        }
    };
}]);


dynamicCal.controller("calDayCtrl", ["$scope", function ($scope) {
    $scope.date = $scope.day.date;
    $scope.events = $scope.day.events;
    //console.log($scope.day, $scope.date, $scope.events);
    this.sortDay = function () {
        $scope.day.sort();
    }
}]);