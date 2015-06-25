dynamicCal.directive('calEvent', ['$document', '$templateCache', 'calEventHandler', '$timeout', function ($document, $templateCache, calEventHandler, $timeout) {


    var getHeight = function (event, cellHeight) {
        var startHours = event.start.getHours() + event.start.getMinutes() / 60;
        var endHours = event.end.getHours() + event.end.getMinutes() / 60;
        if (endHours == 0 && event.start < event.end) endHours = 24;
        var height = (endHours - startHours) * (2 * cellHeight);
        if (height <= 0) height = cellHeight;  // Min height of cellHeight
        return height;
    }
    var getTop = function (event, cellHeight, startTime) {
        var startHours = event.start.getHours() + event.start.getMinutes() / 60;
        return (startHours - startTime) * 2 * cellHeight;
    }
    return {
        restrict: 'E',
        scope: {
            calendar: '=calendar',
            event: '=event',
            onEventClick: '=onEventClick',
            onEventChange: '=onEventChange',
            eventLeft: '=eventLeft',
            eventWidth: '=eventWidth',
            startTime: '=startTime',
            endTime: '=endTime'
        },
        require: ['^calCalendar', '^calDay'],

        //templateUrl: 'calEvent.html',
        template: "<div class='cal-event-wrapper'><ng-include src='templateUrl'></ng-include> <label ng-show='event.edit' class='cal-resize'></label></div>",

        link: function (scope, elem, attrs, controllers) {
            //console.log("Event", elem);
            //console.log("Event", scope.onEventChange);
            var $_ = angular.element;
            var calController = controllers[0];
            var dayController = controllers[1];
            scope.cellHeight = calController.calendar.cellHeight;


            scope.templateUrl = "calEvent.html";
            if (calController.calendar.eventTemplateUrl != null) scope.templateUrl = calController.calendar.eventTemplateUrl;
            else if (calController.calendar.eventTemplate != null) {
                var tempUrl = "calEventTemplate";
                $templateCache.put(tempUrl, calController.calendar.eventTemplate);
                scope.templateUrl = tempUrl;
            }
            



            elem.addClass("cal-event");
            if (scope.event.group != undefined) elem.addClass("cal-group-" + (scope.event.group % 20));

            var startY = 0, y = 0;

            function setDimentions() {
                y = getTop(scope.event, scope.cellHeight, scope.startTime); // elem, { viewStart: scope.startTime, viewEnd: scope.endTime }); //scope.calendar);
                elem.css("height", getHeight(scope.event, scope.cellHeight) + "px"); //elem, { viewStart: scope.startTime, viewEnd: scope.endTime }) + "px"); //scope.calendar) + "px");
                elem.css("top", y + "px");
                stepPx = 2 * scope.cellHeight * scope.calendar.editStep;

                //console.log("SET DIMENTIONS", "height=" + getHeight(scope.event, scope.cellHeight), "top=" + y, "start=" + scope.event.start.getDate() + " " + scope.event.start.getHours() + ":" + scope.event.start.getMinutes(), "end=" + scope.event.end.getDate() + " " + scope.event.end.getHours() + ":" + scope.event.end.getMinutes());
                //if(elem.parent().length > 0)
                //    stepPx = elem.parent()[0].offsetHeight / ((scope.endTime - scope.startTime) / scope.calendar.editStep);// ((scope.calendar.viewEnd - scope.calendar.viewStart) / scope.calendar.editStep);
                elem.css("width", scope.eventWidth);
                elem.css("left", scope.eventLeft);
            }
            scope.$watch("[startTime, endTime]", function (newVal, oldVal) {
                setDimentions();
            });
            scope.$watch("[event.start, event.end, eventWidth, eventLeft]", function (newVal, oldVal) {
                setDimentions();
                if (!calEventHandler.isChanging) {
                    var oldDate = new Date(oldVal[0]); oldDate.setHours(0, 0, 0, 0);
                    var newDate = new Date(newVal[0]); newDate.setHours(0, 0, 0, 0);
                    if (newDate.getTime() != oldDate.getTime()) {
                        calController.eventDateChange(scope.event);
                    }
                    dayController.sortDay();
                }
                // Make 30 minute minimum
                //if ((scope.event.end.getTime() - scope.event.start.getTime()) / 60000 < 30) {
                //    scope.event.end.setHours(scope.event.start.getHours(), scope.event.start.getMinutes() + 30);
                //}
                if ((scope.event.end.getTime() - scope.event.start.getTime()) <= 0) {
                    scope.event.end.setHours(scope.event.start.getHours(), scope.event.start.getMinutes());
                }
            }, true);

            var stepPx = scope.cellHeight * 2 * scope.calendar.editStep;
            console.log("hey");
            $timeout(setupEventChange, 0);
            function setupEventChange() {
                
                var parent = elem;
                while (parent[0].tagName != "CAL-CALENDAR") {
                    parent = parent.parent();
                    if (parent.length == 0) break;
                }

                var dayElements = parent.find('cal-day')
                //var dayElements = parent;
                //if (parent.length == 0) dayElements = parent.find('cal-day')

                var startStartTime = new Date(scope.event.start);
                var startEndTime = new Date(scope.event.end);

                var clickStart, topStart, topEnd, clickEnd;
                var originParent;

                elem.on('click', function () {
                    if(!scope.event.edit) {
                        if (!isChanged() && scope.onEventClick != undefined && scope.onEventClick.constructor == Function)
                            scope.onEventClick(scope.event);
                    }
                })

                elem.on('mousedown', function (e) {
                    closeTip(); // close hover tip
                    if (scope.event.edit && scope.calendar.type != "list") {
                        calEventHandler.start(scope.event, elem);
                        startStartTime = new Date(scope.event.start);
                        startEndTime = new Date(scope.event.end);

                        calEventHandler.isChanging = true;

                        originParent = findParentDay(elem);


                        e.preventDefault();


                        clickStart = e.pageY - elem.parent()[0].offsetTop;
                        topStart = elem[0].offsetTop;// - elem.parent()[0].offsetTop;

                        dayElements.on("mouseenter", mouseenter);
                        $document.on('mousemove', mousemove);
                        $document.on('mouseup', mouseup);
                    }
                });


                function findParentDay(elem) {
                    var count = 10;
                    var dayElem = $_(elem)[0];
                    while (count > 0 && dayElem.tagName != "CAL-DAY") {
                        dayElem = $_(dayElem).parent()[0];
                        count--;
                    }
                    if (dayElem.tagName != "CAL-DAY") dayElem = $_(elem).parent()[0];
                    return dayElem;
                }

                function mouseenter(e, b, c, d) {
                    console.log("mouseenter");
                    var destElem = findParentDay(e.target);
                    var srcElem = findParentDay(elem);
                    calEventHandler.dateChange(scope.event, elem, srcElem, destElem);
                }

                function mousemove(e) {
                    elem.addClass("cal-dragging");
                    clickEnd = e.pageY - elem.parent()[0].offsetTop;
                    topEnd = clickEnd - (clickStart - topStart);
                    var pxMoveOffset = topEnd;

                    //var newHour = Math.max(scope.calendar.viewStart, Math.ceil(pxMoveOffset / (stepPx + 0.0)) * scope.calendar.editStep + scope.calendar.viewStart);
                    var newHour = Math.max(scope.startTime, Math.ceil(pxMoveOffset / (stepPx + 0.0)) * scope.calendar.editStep + scope.startTime);


                    //console.log("Mousemove", newHour, eventLength, scope.calendar.viewStart, pxMoveOffset, stepPx, Math.ceil(pxMoveOffset / (stepPx + 0.0)) * scope.calendar.editStep + scope.calendar.viewStart);
                    var eventLength = (scope.event.end.getTime() - scope.event.start.getTime()) / 1000 / 60 / 60;
                    //newHour = Math.min(newHour, scope.calendar.viewEnd - eventLength);
                    newHour = Math.min(newHour, scope.endTime - eventLength);

                    scope.event.start.setHours(Math.floor(newHour));
                    scope.event.start.setMinutes(newHour % 1 * 60);
                    scope.event.end.setTime(scope.event.start.getTime() + (startEndTime.getTime() - startStartTime.getTime()));


                    scope.$apply();
                }

                function isChanged() {
                    return startStartTime.getTime() != scope.event.start.getTime() || startEndTime.getTime() != scope.event.end.getTime();
                }

                function revert() {
                    calEventHandler.isChanging = true;
                    scope.event.start = new Date(startStartTime);
                    scope.event.end = new Date(startEndTime);
                    //scope.$apply();

                    calEventHandler.dateChange(scope.event, elem, null, null);
                    calEventHandler.isChanging = false;
                }

                function mouseup() {
                    closeTip();
                    elem.removeClass("cal-dragging").removeClass("cal-resizing");
                    calEventHandler.isChanging = false;
                    //delete scope.event.startChanging;
                    if (isChanged()) {
                        if (scope.onEventChange != undefined && scope.onEventChange(scope.event, startStartTime, startEndTime) == false) {
                            revert();
                        }
                        else {
                            var oldDate = new Date(calEventHandler.originStart); oldDate.setHours(0, 0, 0, 0);
                            var newDate = new Date(scope.event.start); newDate.setHours(0, 0, 0, 0);
                            if (oldDate.getTime() != newDate.getTime()) {
                                calController.eventDateChange(scope.event);
                            }
                            else {
                                //console.log("fail", oldDate, newDate);
                            }
                        }
                        dayController.sortDay();
                        scope.$apply();
                    }
                    else {
                        if (scope.onEventClick != undefined && scope.onEventClick.constructor == Function)
                            scope.onEventClick(scope.event);
                    }
                    $document.off('mousemove', resizeMousemove);
                    $document.off('mousemove', mousemove);
                    dayElements.off('mouseenter', mouseenter);
                    $document.off('mouseup', mouseup);
                }


                elem.find('label').on('mousedown', function (e) {
                    closeTip();
                    if (scope.event.edit && scope.calendar.type != "list") {
                        calEventHandler.isChanging = true;
                        e.stopPropagation();
                        startY = e.pageY;
                        startEndTime = new Date(scope.event.end);
                        $document.on('mousemove', resizeMousemove);
                        $document.on('mouseup', mouseup);
                    }
                });

                function resizeMousemove(e) {
                    elem.addClass("cal-resizing");


                    var addedHours = Math.ceil((e.pageY - startY) / (stepPx + 0.0)) * scope.calendar.editStep;
                    var startEndHours = startEndTime.getHours() + (startEndTime.getMinutes() / 60);
                    if (startEndHours == 0 && startEndTime > scope.event.start) startEndHours = 24;
                    var totalHours = startEndHours + addedHours;
                    totalHours = Math.max(totalHours, .5);
                    //console.log("resize:", startEndTime.getHours() + (startEndTime.getMinutes() / 60), startEndTime); //startY, e.pageY, stepPx, scope.calendar.editStep, addedHours, startEndTime.getHours() + (startEndTime.getMinutes() / 60), totalHours);
                    
                    console.log("resizeMousemove", addedHours, totalHours, scope.endTime);

                    //if (totalHours <= scope.calendar.viewEnd) {
                    if (totalHours <= scope.endTime) {
                        if (scope.event.end.getHours() == 0 && scope.event.end.getMinutes() == 0 && scope.event.start < scope.event.end && totalHours != 24) {
                            console.log("subtract one day", scope.event.end);
                            scope.event.end.setDate(scope.event.end.getDate() - 1);
                            console.log("subtract one day", scope.event.end);
                        }
                        if (!(scope.event.end.getHours() == 0 && Math.floor(totalHours) == 24)) scope.event.end.setHours(Math.floor(totalHours));
                        //if (startEndHours == 24) scope.event.end.setDate(scope.event.end.getDate() - 1);
    
                        if (scope.event.end.getMinutes() != totalHours % 1 * 60) scope.event.end.setMinutes(totalHours % 1 * 60);
                        scope.$apply();
                    }
                }


                //Hover over events
                var timeout;
                var time = 500;
                elem.on("mouseenter", function (e) {
                    //timeout = $timeout(function(){
                        openTip(e);
                    //}, time);
                });
                elem.on("mouseleave", function (e) {
                    closeTip(e);
                });

                var tip;
                var tipstartX, tipstartY;
                function openTip(e) {
                    
                    //timeout = $timeout(function () {
                        if (scope.event.hoverHtml != undefined) {
                            if (!elem.hasClass("cal-dragging") && !elem.hasClass("cal-resizing")) {
                                tip = angular.element("<div class='cal-calendar-event-tip'>" + scope.event.hoverHtml + "</div>");
                                $document.find('body').eq(0).append(tip);
                                $document.on("mousemove", setTipPosition);
                                tip.css("top", (e.pageY) + "px").css("left", (e.pageX + 10) + "px");
                            }
                        }
                    //}, time);
                }
                function closeTip() {
                    $timeout.cancel(timeout);
                    if (tip != undefined) {
                        tip.off("mouseover", openTip);
                        tip.remove();
                        $document.off("mousemove", setTipPosition);
                    }
                }
                function setTipPosition(e) {
                    if (tip != undefined) {
                        tip.css("top", (e.pageY) + "px").css("left", (e.pageX + 10) + "px");
                    }
                }
            }
        }
    }
}]);
