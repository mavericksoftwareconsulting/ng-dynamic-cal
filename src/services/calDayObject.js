
dynamicCal.factory('calDayObject', function () {

    function EventWrapper(event) {
        this.event = event;
        this.location = { left: "0%", width: "100%" };
        this.levelWidth = 1;
    }
    var Day = function (date, isPlaceholder) {
        this.date = new Date(date);
        this.date.setHours(0, 0, 0, 0);
        this.isPlaceholder = isPlaceholder == true;
        this.events = [];
    }

    Day.prototype.setEvents = function (events) {
        if (events == null) this.events = [];
        else {
            this.events = new Array(events.length);
            for (var i = 0; i < events.length; i++) {
                this.events[i] = new EventWrapper(events[i]);
            }
            this.sort();
        }
    }
    Day.prototype.addEvent = function (event) {
        this.events.push(new EventWrapper(event));
    }
    Day.prototype.removeEvent = function (event) {
        var changed = false;
        for (var i = 0; i < this.events.length; i++) {
            if (this.events[i].event == event) {
                this.events.splice(i, 1);
                changed = true;
                i--;
            }
        }
        if (changed) this.sort();
    }



    function isOverlap(event, otherEvents){
        for (var i=0; i< otherEvents.length; i++) {
            if(event.event.start < otherEvents[i].event.end && event.event.end > otherEvents[i].event.start) return true;
        }
        return false;
    }

    function buildSortLevels(events){
        var levels = [];
        var event, i, j;
        for (i = 0; i < events.length; i++) {
            event = events[i];
            for(j = 0; j < levels.length; j++){
                if (!isOverlap(event, levels[j])) {
                    break;
                }
            }
            (levels[j] || (levels[j] = [])).push(event);
        }    
        return levels;
    }



    var eventCount = 0;
    Day.prototype.sort = function (reorder) {


        if (this.events.length != eventCount) {
            eventCount = this.events.length;
            for (var i = 0; i < this.events.length; i++) {
                this.events[i].tieBreaker = i;
            }
        }



        if (reorder == null) reorder = true;
        if (reorder) {
            this.events.sort(function (a, b) {
                var startDif = a.event.start.getTime() - b.event.start.getTime();
                if (startDif != 0) return startDif;
                var endDif = a.event.end.getTime() - b.event.end.getTime();
                if (endDif != 0) return endDif;
                else return a.tieBreaker - b.tieBreaker;
            });
        }

        var eventList = [].concat(this.events);

        eventList.sort(function (a, b) {
            var aLength = a.event.end.getTime() - a.event.start.getTime();
            var bLength = b.event.end.getTime() - b.event.start.getTime();
            if (aLength != bLength) return bLength - aLength;
            else return a.event.start.getTime() - b.event.start.getTime();
        });


        var levels = buildSortLevels(eventList);

        var k;
        for (var i = levels.length - 2; i >= 0; i--) {
            for (var j = 0; j < levels[i].length; j++) {
                levels[i][j].levelWidth = 1;
                for(k = i + 1; k < levels.length; k++){
                    if (isOverlap(levels[i][j], levels[k])) break;
                }
                levels[i][j].levelWidth = k - i;
            }
        }


        for (var i = 0; i < levels.length; i++) {
            for (var j = 0; j < levels[i].length; j++) {
                levels[i][j].location = {
                    left: ((92 / levels.length * i) + 4) + "%",
                    width: ((92 / levels.length * levels[i][j].levelWidth)) + "%"
                };
            }
        }

        //var col = 0;
        //var cols = [];
        //while (eventList.length > 0) {
        //    cols.push(eventList.splice(0, 1));
        //    var top = cols[col][0].event.start.getTime();
        //    var bottom = cols[col][0].event.end.getTime();
        //    for (var k = 0; k < eventList.length; k++) {
        //        if (eventList[k].event.end.getTime() <= top || eventList[k].event.start.getTime() >= bottom) {
        //            var newEvent = eventList.splice(k, 1)[0];
        //            top = Math.min(top, newEvent.event.start.getTime());
        //            bottom = Math.max(bottom, newEvent.event.end.getTime());
        //            cols[col].push(newEvent);
        //            k--;
        //        }
        //    }
        //}
        //for (var k = 0; k < cols.length; k++) {
        //    for (var l = 0; l < cols[k].length; l++) {
        //        cols[k][l].location = { left: (100 / cols.length * k) + "%", width: (100 / cols.length) + "%" };
        //    }
        //}

    }













    //Day.prototype.sort = function (reorder) {
    //    if(reorder == null) reorder = true;
    //    if (reorder) {
    //        this.events.sort(function (a, b) {
    //            var startDif = a.event.start.getTime() - b.event.start.getTime();
    //            if (startDif != 0) return startDif;
    //            else return a.event.end.getTime() - b.event.end.getTime();
    //        });
    //    }

    //    var eventList = [].concat(this.events);



    //    eventList.sort(function (a, b) {
    //        var aLength = a.event.end.getTime() - a.event.start.getTime();
    //        var bLength = b.event.end.getTime() - b.event.start.getTime();
    //        if (aLength != bLength) return bLength - aLength;
    //        else return a.event.start.getTime() - b.event.start.getTime();
    //    });

    //    var col = 0;
    //    var cols = [];
    //    while(eventList.length > 0){
    //        cols.push(eventList.splice(0, 1));
    //        var top = cols[col][0].event.start.getTime();
    //        var bottom = cols[col][0].event.end.getTime();
    //        for (var k = 0; k < eventList.length; k++) {
    //            if (eventList[k].event.end.getTime() <= top || eventList[k].event.start.getTime() >= bottom) {
    //                var newEvent = eventList.splice(k, 1)[0];
    //                top = Math.min(top, newEvent.event.start.getTime());
    //                bottom = Math.max(bottom, newEvent.event.end.getTime());
    //                cols[col].push(newEvent);
    //                k--;
    //            }
    //        }
    //    }
    //    for (var k = 0; k < cols.length; k++) {
    //        for (var l = 0; l < cols[k].length; l++) {
    //            cols[k][l].location = { left: (100 / cols.length * k) + "%", width: (100 / cols.length) + "%" };
    //        }
    //    }

    //    //*************************************

    //    //var eventList = [].concat(this.events);
    //    //eventList.sort(function (a, b) {
    //    //    var startDif = a.event.start.getTime() - b.event.start.getTime();
    //    //    if (startDif != 0) return startDif;
    //    //    else return a.event.end.getTime() - b.event.end.getTime();
    //    //});

    //    //var rowStart = 0;
    //    //var latest = 0;
    //    //for (var k = 0; k <= eventList.length; k++) {
    //    //    if (k == eventList.length || eventList[k].event.start.getTime() > latest) {
    //    //        var widthPercent = 100 / (k - rowStart);
    //    //        for (var m = rowStart; m < k; m++) {
    //    //            eventList[m].location.width = widthPercent;
    //    //            eventList[m].location.left = (m - rowStart) * widthPercent;
    //    //            eventList[m].location.left = eventList[m].location.left + "%";
    //    //            eventList[m].location.width = eventList[m].location.width + "%";
    //    //        }
    //    //        rowStart = k;
    //    //    }
    //    //    if (k != eventList.length && eventList[k].event.end.getTime() > latest) {
    //    //        latest = eventList[k].event.end.getTime();
    //    //    }
    //    //}
    //}

    return Day;
})
