const plot = require('labs-plot');
const fitter = require('labs-fitter');

const plotWithFit = (e, columns, fit, name, cb) => {
    if (columns.length != 2) {
        throw 'Only 2D table for now, mate.';
    }
    let title = id => ({ title: '$' + e.obj(id).latexName + ' (' + e.obj(id).unit + ')$' });
    plot.plot(e.originTable(columns), columns.map(title), fit, cb);
};

const fullPlot = (e, columns, resultFolder, name, label) => {
    fs.mkdir(resultFolder, () => {
        fs.writeFile(resultFolder + '/' + label + '.latex', e.fullLatexTable(columns, name, label)); 
        fs.writeFile(resultFolder + '/' + label + '.origin', e.originTable(columns)); 

        let fit = fitter.fitLin(e, ...columns);
        fs.writeFile(resultFolder + '/' + label + '.fit', JSON.stringify(e.parse(fit))); 
        plotWithFit(e, columns, fit, resultFolder + '/' + label + '.png');
    });
};

module.exports = { fullPlot };