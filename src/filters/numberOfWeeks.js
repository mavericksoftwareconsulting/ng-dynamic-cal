
dynamicCal.filter('numberOfWeeks', function () {
    return function (set, startDate, endDate) {

        var beginning = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() - startDate.getDay());
        var end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate() + (6 - endDate.getDay()))
        var numberOfWeeks = (((end.getTime() - beginning.getTime()) / 1000 / 60 / 60 / 24) + 1) / 7;

        //if (numberOfWeeks == 1) {
        //    beginning = new Date(startDate);
        //    end = new Date(endDate);
        //}

        //weekArray = new Array(numberOfWeeks);
        //var cur = new Date(beginning);
        //for (var i = 0; i < numberOfWeeks; i++){
        //    weekArray[i] = new Array();
        //    for (var j = 0; j < 7 && cur <= end; j++) {
        //        if (cur >= startDate && cur <= endDate) weekArray[i].push(new Date(cur));
        //        else weekArray[i].push(null);
        //    }
        //}
        //return weekArray;








        //if (numberOfWeeks == 1) {
        //    beginning = new Date(startDate);
        //    end = new Date(endDate);
        //}

        //var weekArray = new Array(numberOfWeeks);
        //var cur = new Date(beginning);
        //for (var i = 0; i < numberOfWeeks; i++) {
            
        //    weekArray[i] = new Array(7);
        //    for (var j = 0 ; j < 7; j++) {
        //        weekArray[i][j] = i + " " + j;
        //    }

        //    //for (var j = 0; j < 7 && cur <= end; j++) {
        //    //    if (cur >= startDate && cur <= endDate) weekArray[i].push(2);
        //    //    else weekArray[i].push(-1);
        //    //}
        //    //cur.setDate(cur.getDate() + 1);
        //}
        //return weekArray;




        var array = new Array();
        for (var i = 0 ; i < 4; i++) {
            array.push([2, 3, 4, 5, 6]);
            //array.push(new Array());
            //for (var j = 0; j < 5; j++) {
            //    array[i].push(j);
            //}
        }
        set = array;
        return array;




        //var endWeekEnd = (endDate.getTime() / 1000 / 60 / 60 / 24) + (6 - endDate.getDay());
        //var startWeekStart = (startDate.getTime() / 1000 / 60 / 60 / 24) - startDate.getDay();
        //numberOfWeeks = (endWeekEnd - startWeekStart + 1) / 7;
        
    };
});