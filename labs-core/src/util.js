const _ = require('lodash');

const build = function(map, values, defaults) {
    return Object.keys(map || []).reduce(function(result, key) {
        if (_.isObject(map[key]) && !Array.isArray(map[key])) {
            result[key] = map[key];
            result[key].key = key;
            return result;
        }
        result[key] = {};
        values.forEach(function(current, i) {
            result[key][current] = map[key][i] || (defaults ? defaults[i] : undefined);
        });
        result[key].key = key;
        return result;
    }, {});
};

const remove = function(arr) {
    let what, a = arguments,
        L = a.length,
        ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax = arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};

module.exports = { build, remove };
