const fs = require('fs');

const Decimal = require('decimal.js');
const plotly = require('plotly');
const request = require('request');
const _ = require('lodash');

const download = (uri, filename, callback) => {
    request.head(uri, (err, res, body) => {
        let r = request(uri).pipe(fs.createWriteStream(filename));
        if (callback) {
            r.on('close', callback);
        }
    });
};

const build = cb => {
    fs.readFile(require('os').homedir() + '/.plotly.data', 'utf8', function(err, data) {
        let a = data.trim().split(':');
        cb(plotly(a[0], a[1]));
    });
};

const plot = (originTable, names, fit, name, cb) => {
    let table = _.unzip(originTable.split('\n').slice(1).map(a => a.split('\t')));
    let traces = [];
    traces.push({
        x: table[0],
        y: table[2],
        name: 'Data',
        mode: 'markers',
        error_x: {
            type: 'data',
            array: table[1],
            visible: true
        },
        error_y: {
            type: 'data',
            array: table[3],
            visible: true
        },
        type: 'scatter'
    });
    if (fit) {
        let xs = [table[0].reduce((a, b) => Math.min(a, b)), table[0].reduce((a, b) => Math.max(a, b))];
        let f = x => fit[0].value.times(new Decimal(x)).plus(fit[1].value).toFixed();
        traces.push({
            x: xs,
            y: xs.map(f),
            name: 'Fit',
            mode: 'line'
        });
    }

    let graphOptions = {
        filename: 'labs-chart-2',
        fileopt: 'overwrite',
        layout: {
            xaxis: names[0],
            yaxis: names[1]
        }
    };
    build(plotly => {
        plotly.plot(traces, graphOptions, function(error, data) {
            if (error) console.error(error);
            download(data.url + '.png', name + '.png', cb);
        });
    });
};

module.exports = { plot };
