module.exports = function(app) {
    app.locals.title = 'Тестовое задание';
    app.locals.fib = function(n) {
        var f;
        var f0 = 0;
        var f1 = 1;
        if(n === 0) return f0;
        if(n === 1) return f1;
        for(var i = 1; i < n; i++) {
            f = f0 + f1;
            f0 = f1;
            f1 = f;
        }
        return f;
    };
};