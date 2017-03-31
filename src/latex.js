Latex = (function() {
    var Latex = {};

    var elToLatex = function(el) {
        var m = el.multiplier ? ' ' + el.multiplier : '';
        return '$' + el.value + ' \\pm ' + el.error + m + '$';
    };

    Latex.latexTable = function (names, env) {
        var table = env.table(names).map(function(row) {
            return row.map(elToLatex);
        });
        table.splice(0, 0, names.map(function(name) {
            var variable = env.vars[name];
            var unit = env.fetchUnit(variable);
            return '$' + variable.name + (unit == '' ? '' : ' (' + unit + ')') + '$';
        }.bind(env)));
        return table.map(function(row) {
            return row.join(' & ');
        }).join(' \\\\\n');
    };

    return Latex;
})();
