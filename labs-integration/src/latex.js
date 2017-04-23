const _ = require('lodash');

let Latex = (function() {
    var Latex = {};

    const mode = function(arr) {
        return _.chain(arr).countBy().toPairs().maxBy(_.last).head().value();
    };

    const mix = function(m, dm) {
        let mm = Env.MULTIPLIERS[m].multiplier - Env.MULTIPLIERS[dm].multiplier;
        return Object.values(Env.MULTIPLIERS).find(e => e.multiplier == mm).name;
    };

    const findDm = function(row) {
        return mode(row.map(el => el.multiplier));
    };

    const makeHeaders = function (env, names) {
        let t = _.unzip(env.table(names));
        return names.map((name, i) => ({ name : name, dm : findDm(t[i])}));
    };

    const elToLatex = function(el, dm) {
        let origM = mix(el.multiplier, dm);
        let m = origM ? ' ' + origM : '';
        return '$' + el.value + ' \\pm ' + el.error + m + '$';
    };

    function header(env, name, dm) {
        let variable = env.vars[name];
        let unit = env.fetchUnit(variable);
        return '$' + variable.name + (unit === '' ? '' : ' (' + dm + unit + ')') + '$';
    }

    Latex.latexTable = function(names, env) {
        let headers = makeHeaders(env, names);
        let table = env.table(names).map(function(row) {
            return row.map((a, i) => elToLatex(a, headers[i].dm));
        });
        table.splice(0, 0, headers.map(function(header) {
            return header(env, header.name, header.dm);
        }.bind(env)));
        return table.map(function(row) {
            return row.join(' & ');
        }).join(' \\\\\n');
    };

    Latex.fullLatexTable = function(names, caption, ref, env) {
        let headers = makeHeaders(env, names);
        let body = env.table(names).map(function(row) {
            return row.map((a, i) => elToLatex(a, headers[i].dm)).join(' & ') + ' \\\\';
        }).join('\n');
        return [
            '\\begin{longtable}[c]{|' + ' c |'.repeat(names.length) + '}',
            '\\caption{' + caption + '\\label{tab:' + ref + '}}\\\\',
            '\\hline',
            headers.map(h => header(env, h.name, h.dm)).join(' & ') + ' \\\\',
            '\\hline',
            '\\endhead',
            '\\hline',
            '\\endfoot',
            '\\hline',
            '\\caption*{ ' + names.map(n => '$' + env.name(n) + '$: desc...').join('; ') + '}',
            '\\endlastfoot',
            body,
            '\\end{longtable}'
        ].join('\n');
    };

    return Latex;
})();

module.exports = Latex;
