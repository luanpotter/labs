const { Env, EnvBuilder } = require('labs');
const jQuery = require('jquery');
const _ = require('lodash');

require('./style.css');

jQuery(function ($) {
  let main = $('<div>');
  main.append($('<textarea>').attr('id', 'src'));
  main.append($('<button>').on('click', function () {
    $('#result, #errors').text('');
    try {
      $('#result').text(parse($('#src').val()));
    } catch (ex) {
      $('#errors').text(ex);
    }
  }).text('Click me!'));
  main.append($('<div>').attr('id', 'result'));
  main.append($('<div>').attr('id', 'errors'));
  $('body').append(main);
});

const parse = src => {
  let data = src.split('\n').map(l => l.split(/[ \t]+/));
  let hasHeaders = data.map(el => el[0]).some(el => /[a-zA-Z]/.test(el));
  if (!hasHeaders && data.length % 2 === 1) {
    throw 'Precisa de número par de colunas, ou cabeçalhos...';
  }
  let headers = hasHeaders ? data.shift() : _.range(data.length/2).map(i => ['v' + i, 'e_v' + i]);
  let u = _.uniq(data.map(el => el.length));
  if (u.length !== 1 || u[0] !== headers.length) {
    throw 'Todas as linhas precisam ter o mesmo número de colunas.';
  }
  return 'asd' + src + '!';
};
