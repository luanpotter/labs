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
  let data = _.unzip(src.split('\n').map(l => l.split('\t')));
  let hasHeader = data.map(el => el[0]).some(el => /[a-zA-Z]/.test(el)));
  !hasHeaders && data.length % 2 && throw 'Precisa de número par de colunas, ou cabeçalhos...';
  let headers = hasHeaders ? data.shift() : _.range(data.length/2).map(i => 'v' + i);
  return 'asd' + src + '!';
};
