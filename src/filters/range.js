
dynamicCal.filter('range', function () {
    return function (input, a, b, c) {
        var start = a;
        var end = b;
        var step = c;
        if (c == undefined) step = 1;
        if (b == undefined) {
            start = 0;
            end = a;
        }
        for (var i = start; i < end; i += step)
            input.push(i);
        return input;
    };
});


