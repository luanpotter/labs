const jimp = require('jimp');

let img = new jimp(256*3, 256, (err, img) => {
    if (err) {
        console.log('Error', err);
        return;
    }
    img.write('test.png');
});

const componentToHex = c => {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
};

const toHex = (...c) => c.map(componentToHex).join('');

const colors  = {};
colors.rgba = (r, g, b, a) => parseInt('0x' + toHex(r, g, b, a)),
colors.rgb = (r, g, b) => colors.rgba(r, g, b, 255),
colors.red = colors.rgb(255, 0, 0),
colors.green = colors.rgb(0, 255, 0),
colors.blue = colors.rgb(0, 0, 255),
colors.white = colors.rgb(255, 255, 255),
colors.black = colors.rgb(0, 0, 0)

const fillRect = (img, x, y, w, h, color) => {
    img.scan(x, y, w, h, function (dx, dy, offset) {
        this.bitmap.data.writeUInt32BE(color, offset, true);
    });
};

const drawRect = (img, x, y, w, h, color) => {
    img.scan(x, y, w, h, function (dx, dy, offset) {
        if (dx === x || dy === y || dx === x + w - 1 || dy === y + h - 1) {
            this.bitmap.data.writeUInt32BE(color, offset, true);
        }
    });
};

const wrap = fn => {
    if (fn === null) {
        return fn;
    }
    fn.fillRect = (x, y, w, h, color) => fillRect(fn, x, y, w, h, color);
    fn.drawRect = (x, y, w, h, color) => drawRect(fn, x, y, w, h, color);
    fn.bg = color => fillRect(fn, 0, 0, fn.bitmap.width, fn.bitmap.height, color);
    fn.width = () => fn.bitmap.width;
    fn.height = () => fn.bitmap.height;
    return fn;
};

const create = (w, h, cb) => {
    new jimp(w, h, (err, img) => cb(err, wrap(img)));
};

const read = (file, cb) => {
    jimp.read(file, (err, img) => cb(err, wrap(img)));
};

module.exports = { create, read, wrap, colors };
