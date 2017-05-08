const Jimp = require('jimp');
const fs = require('fs');

const debug = false;

const inFile = 'calibracao-2.png';
const outFile = 'calibracao-2-out.png';
const W = 1280, H = 899, X0 = 240, XF = 250, Y0 = 120, YF = 160;

const dataFile = 'g4-novo/exp1-hg-ar-sl-b.txt';
let ys = fs.readFileSync(dataFile, 'utf-8').split('\n').map(el => el.split('\t').map(parseFloat));
const fy = x => ys.find(el => el[0] === x)[1];

const data = [
    [499, 365.015],
    [607, 404.656],
    [615, 407.783],
    [692, 435.833],
    [1002, 546.074],
    [1090, 576.96],
    [1096, 579.066],
    [1444, 696.543],
    [1475, 706.722],
    [1499, 714.704],
    [1538, 727.294],
    [1573, 738.398],
    [1613, 750.387],
    [1652, 763.511],
    [1679, 772.376],
    [1750, 794.818],
    [1771, 800.616],
    [1803, 811.531],
    [1851, 826.452],
    [1899, 840.82],
    [1904, 842.465],
    [1935, 852.144],
    [1984, 866.794]
];

let img;

Jimp.read(inFile).then(function (argImg) {
    img = argImg;
    return Jimp.loadFont(Jimp.FONT_SANS_8_BLACK);
}).then(function (font) {
    if (debug) {
        img = img.print(font, X0, 10, '.------');
        img = img.print(font, W - XF, 10, '.------');
        img = img.print(font, 10, Y0, '.++++++');
        img = img.print(font, 10, H - YF, '.++++++');
    }
    console.log('-------');
    console.log(X0, W - XF, (W - X0 - XF));
    console.log('-------');
    for (let i = 0; i < data.length; i++) {
        let x = X0 + (W - X0 - XF) * (data[i][0] - 500) / 1500;
        let y = H - YF - (H - Y0 - YF) * fy(data[i][0])/ 70000;
        console.log(x, y, fy(data[i][0]));
        img = img.print(font, x, y, '' + data[i][1]);
    }
    img.write(outFile);
}).catch(function (err) {
    console.error(err);
});
