const jimp = require('./jimp-draw');
const Jimp = require('jimp');

const _ = require('lodash');
const sq = x => x*x;
const round = num => parseFloat(Math.round(num * 100) / 100).toFixed(2);

Jimp.loadFont(Jimp.FONT_SANS_8_BLACK).then(function (sans8) {
    Jimp.loadFont(Jimp.FONT_SANS_16_BLACK).then(function (sans16) {
        jimp.create(256*3, 256, (err, img) => {
            if (err) {
                console.log('Error', err);
                return;
            }
            img.bg(jimp.colors.white);
            img.drawRect(0, 0, img.width(), img.height(), jimp.colors.black);
            img.drawRect(256, 0, 256, img.height(), jimp.colors.black);
        
            const hlevels = _.range(3).map(i => -13.6/sq(i + 1));
            const maxHeight = 160;
            const sy = (img.height() - maxHeight)/2;
            _.range(3).map(i => i * 256).forEach(sx => {
                hlevels.forEach((level, i) => {
                    let dy = -level*maxHeight/13.6 + sy;
                    img.print(sans8, sx + 5, dy - 4, '' + (i + 1));
                    img.fillRect(sx + 10, dy, 216, 1, jimp.colors.rgb(120, 120, 120));
                    img.print(sans8, sx + 228, dy - 5, round(level));
                    if (sx === 0) return;
                    _.range(i + 1).map(i => 'spdfghij'[i]).forEach((sublevel, j) => {
                        let orbitalX = sx + 10 + 32*j;
                        let orbitalY = dy - 10*j - 2;
                        img.fillRect(orbitalX, orbitalY, 20, 1, jimp.colors.rgb(120, 120, 120));
                        img.print(sans8, orbitalX + 22, orbitalY - 4, sublevel);

                        _.range(3).forEach(i => {
                            img.fillRect(orbitalX + 2, orbitalY - 1 - i*4, 16, 1, jimp.colors.rgb(120, 120, 120));
                            _.range(5).forEach(j => {
                                img.fillRect(orbitalX + 2 + 5*i, orbitalY - 1 - i*4 - 2*j, 4, 1, jimp.colors.rgb(120, 120, 120));
                            });
                        });
                    });
                });
            });
            img.print(sans16, 10, 10, 'Níveis Eletrônicos');
            img.print(sans16, 266, 10, 'Subníveis');
            img.print(sans16, 522, 10, 'Rotacionais e Vibracionais');

            img.write('niveis-subniveis-rot-vib.png');
        });

        jimp.create(256, 400, (err, img) => {
            if (err) {
                console.log('Error', err);
                return;
            }
            img.bg(jimp.colors.white);
            img.drawRect(0, 0, img.width(), img.height(), jimp.colors.black);

            let orbitalX = 20, orbitalY = img.height() - 40;
            let dx = img.width() - 40;
            img.fillRect(orbitalX, orbitalY, dx, 1, jimp.colors.black);
            img.print(sans16, orbitalX, orbitalY, '1s');
            img.print(sans8, 10, 10, 'Transição entre dois Níveis Eletrônicos variando J e v');

            _.range(3).forEach(i => {
                let dy = 20;
                img.fillRect(orbitalX + 2, orbitalY - 1 - i*dy, dx, 1, jimp.colors.rgb(60, 60, 60));
                img.print(sans8, orbitalX + 4 + dx, orbitalY - 5 - i*dy, 'v' + i);
                _.range(7).forEach(j => {
                    img.fillRect(orbitalX + 2 + 75*i, orbitalY - 1 - i*dy - dy/5*j, 40, 1, jimp.colors.rgb(120, 120, 120));
                    img.print(sans8, orbitalX + 4 + 75*i + 40, orbitalY - 5 - i*dy - dy/5*j, 'J' + j);
                });
            });

            orbitalY -= 200;
            img.fillRect(orbitalX, orbitalY, dx, 1, jimp.colors.black);
            img.print(sans16, orbitalX, orbitalY, '2s');

            _.range(3).forEach(i => {
                let dy = 20;
                img.fillRect(orbitalX + 2, orbitalY - 1 - i*dy, dx, 1, jimp.colors.rgb(60, 60, 60));
                img.print(sans8, orbitalX + 4 + dx, orbitalY - 5 - i*dy, 'v' + i);
                _.range(7).forEach(j => {
                    img.fillRect(orbitalX + 2 + 75*i, orbitalY - 1 - i*dy - dy/5*j, 40, 1, jimp.colors.rgb(120, 120, 120));
                    img.print(sans8, orbitalX + 4 + 75*i + 40, orbitalY - 5 - i*dy - dy/5*j, 'J' + j);
                });

            });

            img.write('rot-vib-details.png');
       });
    });
});