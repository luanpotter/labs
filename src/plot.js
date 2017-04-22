const plotly = require('plotly');
const fs = require('fs');
const _ = require('lodash');
const request = require('request');

const curve = require('./curve-fitting');

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

const plot = (e, columns, name, cb) => {
    plotWithFit(e, columns, null, name, cb);
};

const plotWithFit = (e, columns, fit, name, cb) => {
    if (columns.length != 2) {
        throw 'Only 2D table for now, mate.';
    }
    let table = _.unzip(e.originTable(columns).split('\n').slice(1).map(a => a.split('\t')));
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

    let title = id => ({ title: '$' + e.obj(id).latexName + ' (' + e.obj(id).unit + ')$' });

    let graphOptions = {
        filename: 'labs-chart',
        fileopt: 'overwrite',
        layout: {
            xaxis: title(columns[0]),
            yaxis: title(columns[1])
        }
    };
    build(plotly => {
        plotly.plot(traces, graphOptions, function(error, data) {
            download(data.url + '.png', name + '.png', cb);
        });
    });
};

const fullPlot = (e, columns, resultFolder, name, label) => {
    fs.mkdir(resultFolder, () => {
        fs.writeFile(resultFolder + '/' + label + '.latex', e.fullLatexTable(columns, name, label)); 
        fs.writeFile(resultFolder + '/' + label + '.origin', e.originTable(columns)); 

        let fit = curve.fitLin(e, ...columns);
        fs.writeFile(resultFolder + '/' + label + '.fit', JSON.stringify(e.parse(fit))); 
        plotWithFit(e, columns, fit, resultFolder + '/' + label + '.png');
    });
};

module.exports = { plot, plotWithFit, fullPlot };
