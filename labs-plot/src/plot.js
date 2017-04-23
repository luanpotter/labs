const fs = require('fs');

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

const plot = (table, names, fit, cb) => {
    let table = _.unzip(table.split('\n').slice(1).map(a => a.split('\t')));
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
        let xs = [table[0][0], table[0].slice(-1).pop()];
        let f = x => fit[0].value.times(new Decimal(x)).plus(fit[1].value).toFixed();
        traces.push({
            x: xs,
            y: xs.map(f),
            name: 'Fit',
            mode: 'line'
        });
    }

    let graphOptions = {
        filename: 'labs-chart',
        fileopt: 'overwrite',
        layout: {
            xaxis: title(names[0]),
            yaxis: title(names[1])
        }
    };
    build(plotly => {
        plotly.plot(traces, graphOptions, function(error, data) {
            download(data.url + '.png', name + '.png', cb);
        });
    });
};

module.exports = { plot };
