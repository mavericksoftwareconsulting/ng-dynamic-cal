dynamicCal.directive('calHeader', ['$templateCache', function ($templateCache) {

    return {
        restrict: 'E',
        template: "<ng-include src='templateUrl'/> ",  //
        require: ['^calCalendar'],
        scope: {
            //calendar: '=calendar',
            calendar: '=config'
        },
        controller: 'calHeaderCtr',
        link: function (scope, elem, attrs, controller) {
            
        }
    }
}]);

dynamicCal.controller("calHeaderCtr", ["$scope", function ($scope) {
    var contr = this;
    $scope.$watch('calendar', function () { contr.calendar = $scope.calendar; })


    var tempUrl = 'calDefaultHeaderUrl';
    if ($scope.calendar != undefined) {
        var template = $scope.calendar.headerTemplate;
        var templateUrl = $scope.calendar.headerTemplateUrl;
    }

    if (templateUrl == null || templateUrl == undefined || templateUrl == "") {
        if (template == null || template == undefined || template == "") templateUrl = "calHeader.html";
        else {
            $templateCache.put(tempUrl, template);
            templateUrl = tempUrl;
        }
        //scope.templateUrl = tempUrl;
    }
    $scope.templateUrl = templateUrl;

}]);



dynamicCal.directive('calPrevious', function () {
    return {
        require: ['^calHeader'],
        link: function (scope, elem, attrs, controller) {
            elem.on('click', function () {
                controller[0].calendar.prev();
            });
        }
    }
});
dynamicCal.directive('calNext', function () {
    return {
        require: ['^calHeader'],
        link: function (scope, elem, attrs, controller) {
            elem.on('click', function () {
                controller[0].calendar.next();
            });
        }
    }
});
dynamicCal.directive('calToday', function () {
    return {
        require: ['^calHeader'],
        compile: function (el, attrs) {
            console.log("IN COMPILE");
            return function (scope, elem, attrs, controller) {
                console.log("IN LINK");
                elem.on('click', function () {
                    if(!(scope.calendar.today >= scope.calendar.startDate && scope.calendar.today <= scope.calendar.endDate)){
                        console.log("hey");
                        controller[0].calendar.goToToday();
                        scope.$apply();
                    }
                });
                scope.calendar = controller[0].calendar;
            }
        },
        //link: function (scope, elem, attrs, controller) {
        //    console.log("IN LINK");
        //    elem.on('click', function () {
        //        console.log("hey");
        //        controller[0].calendar.goToToday();
        //    });
        //}      
    }
});
dynamicCal.directive('calTitle', function () {
    return {
        require: ['^calHeader'],
        template: "{{ctrl.calendar.title}}",
        link: function (scope, elem, attrs, controller) {
            elem.on('click', function () {
                controller[0].calendar.today();
            });
            scope.ctrl = controller[0];
        }
    }
});

dynamicCal.directive('calViewToggle', function () {
    return {
        require: ['^calHeader'],
        link: function (scope, elem, attrs, controller) {
            scope.calListClasses = attrs.calListClass == undefined ? [] : attrs.calListClass.split(' ');
            scope.calScheduleClasses = attrs.calScheduleClass == undefined ? [] : attrs.calScheduleClass.split(' ');
            elem.on('click', function () {
                console.log("hey", controller[0].calendar);
                if (scope.ctrl.calendar.type == "list") controller[0].calendar.type = "schedule";
                else scope.ctrl.calendar.type = "list";
                scope.$apply();
            });
            scope.ctrl = controller[0];
            scope.$watch('ctrl.calendar.type', function () {

                if (scope.ctrl.calendar.type == 'list') for (var i = 0; i < scope.calListClasses.length; i++) elem.addClass(scope.calListClasses[i]);
                else for (var i = 0; i < scope.calListClasses.length; i++) elem.removeClass(scope.calListClasses[i]);
                if (scope.ctrl.calendar.type == 'schedule') for (var i = 0; i < scope.calScheduleClasses.length; i++) elem.addClass(scope.calScheduleClasses[i]);
                else for (var i = 0; i < scope.calScheduleClasses.length; i++) elem.removeClass(scope.calScheduleClasses[i]);
                console.log("type changed");
            })
        }
    }
});



dynamicCal.directive('calDurrationBtn', function () {
    return {
        require: ['^calHeader'],
        //template: '{{durration}} hey',
        link: function (scope, elem, attrs, controller) {
            var dur = attrs.calDurrationBtn.toLowerCase();
            //console.log(dur);
            if (dur != "week" && dur != "day" && dur != "month") throw "calDurrationBtn must be either 'month', 'week', or 'day'";
            scope.durration = dur;
            console.log("dur", dur, scope.durration);
            scope.$watch('durration', function () { console.log("durration changed", scope.durration, dur); })

            scope.selectedClasses = attrs.calSelectedClass == undefined ? [] : attrs.calSelectedClass.split(' ');

            scope.ctrl = controller[0];
            elem.on('click', function () {
                scope.ctrl.calendar.durration = dur;
                scope.$apply();
            });
            scope.$watch('ctrl.calendar.durration', function () {
                console.log(dur, scope.ctrl.calendar.durration);
                if (scope.ctrl.calendar.durration == dur) for (var i = 0; i < scope.selectedClasses.length; i++) elem.addClass(scope.selectedClasses[i]);
                else for (var i = 0; i < scope.selectedClasses.length; i++) elem.removeClass(scope.selectedClasses[i]);
            })
        }
    }
});


