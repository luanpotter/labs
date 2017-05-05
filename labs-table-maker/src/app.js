const { Env, EnvBuilder } = require('labs');
const jQuery = require('jquery');
const _ = require('lodash');

require('./style.css');

jQuery(function ($) {
  let main = $('<div>');
  main.append($('<textarea>').attr('id', 'src'));
  main.append($('<div>').append($('<span>').text('dotMode')).append($('<input>').attr('id', 'dotMode').attr('type', 'checkbox').prop('checked', true)));
  main.append($('<button>').on('click', function () {
    $('#result, #errors').text('');
    try {
      let input = $('#src').val()
      let dotMode = $('#dotMode').prop('checked');
      $('#result').html(parse(input, dotMode).replace(/\n/g, '<br />'));
    } catch (ex) {
      $('#errors').text(ex + ex.stack);
    }
  }).text('Click me!'));
  main.append($('<div>').attr('id', 'result'));
  main.append($('<div>').attr('id', 'errors'));
  $('body').append(main);
});

const parse = (src, dotMode) => {
  let data = src.split('\n').map(l => l.split(/[ \t]+/));

  let u = _.uniq(data.map(el => el.length));
  if (u.length !== 1) {
    throw 'Todas as linhas precisam ter o mesmo número de colunas.';
  }

  let hasHeaders = data.map(el => el[0]).some(el => /[a-zA-Z]/.test(el));
  if (!hasHeaders && u[0] % 2 === 1) {
    throw 'Precisa de número par de colunas, ou cabeçalhos...';
  }

  let headers = hasHeaders ? data.shift() : _.flatMap(_.range(data[0].length/2), i => ['v' + i, 'e_v' + i]);
  let has = c => data.some(cl => cl.some(el => el.includes(c)));
  if (has(',') && !has('.')) {
    data = data.map(c => c.map(el => el.replace(/,/g, '.')));
  }

  let table = _.unzip(data).map((datum, i) => ({ header : headers[i], data : datum }));
  let values = _.chunk(table, 2).map(a => ({ header : a[0].header,  values : a[0].data, errors : a[1].data }));

  let b = new EnvBuilder();
  const extractUnit = n => {
    let match = /.*\(\\?[a-zA-Z]\)$/.exec(n);
    return match ? match[1] : '';
  };
  values.forEach(value => b.variableObj({ name : value.header, unit : extractUnit(value.header) }));

  let e = b.build();
  values.forEach(value => e.add(value.header, value.values.map((datum , i) => [datum, value.errors[i]])));

  let latex = e.fullLatexTable(values.map(e => e.header), 'MY TABLE', 'mylable');
  if (!dotMode) {
    latex = latex.split('\n').map(line => line.startsWith('$') ? line.replace(/\./g, ',') : line).join('\n');
  }
  return latex;
};
