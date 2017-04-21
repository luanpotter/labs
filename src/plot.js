const plotly = require('plotly');
const fs = require('fs');
const _ = require('lodash');
const request = require('request');

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
    if (columns.length != 2) {
        throw 'Only 2D table for now, mate.';
    }
    let table = _.unzip(e.originTable(columns).split('\n').slice(1).map(a => a.split('\t')));
    let data = [{
        x: table[0],
        y: table[2],
        mode: 'markers',
        error_x: {
            type: "data",
            array: table[1],
            visible: true
        },
        error_y: {
            type: "data",
            array: table[3],
            visible: true
        },
        type: "scatter"
    }];

    let graphOptions = { filename: name, fileopt: "overwrite" };
    build(plotly => {
        plotly.plot(data, graphOptions, function(error, data) {
            download(data.url + '.png', name + '.png', cb);
        });
    });
};

module.exports = { plot };