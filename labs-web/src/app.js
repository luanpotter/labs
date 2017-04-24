const { Env, EnvBuilder, Guide } = require('labs');
const jQuery = require('jquery');

const terminalHtml = require('./terminal.html');
require('./cssterm.css');
require('./style.css');

window.Env = Env;
window.EnvBuilder = EnvBuilder;

jQuery(function ($) {
  let main = $('<div>');
  main.html(terminalHtml);
  $('body').append(main);

  setup($);
});

let setup = ($) => {
    const FNS = {
        ':start': function() {
            append('>', 'out', guide.start());
        },
        ':q': function() {
            guide = new Guide();
            append('>', 'out', 'Left interactive mode.');
        },
        ':clear': function() {
            $('#list').text('');
            env = {};
            guide = new Guide();
        }
    };

    var history = [],
        currentIndex = 0,
        currentText = '';

    var env = {};
    var guide = new Guide();

    var append = function(c, cl, te) {
        var ts = Array.isArray(te) ? te : [ te ];
        ts.forEach(function (t) {
            $('#list').append($('<span>').addClass(cl).text(c + ' ' + t)).append($('<br>'));
        });
    };

    var parse = function(command) {
        append('>', 'in', command);
        if (guide.on()) {
            append('<', 'out', guide.next(command));
            return;
        }
        try {
            var result = new Function('return ' + command).bind(env)();
            if (result) {
                append('<', 'out', JSON.stringify(result));
            }
        } catch (e) {
            append('<', 'err', e);
        }
    };

    var cacheCurrentText = function(command) {
        if (currentIndex == 0) {
            currentText = command;
        }
    };

    var readHistory = function() {
        if (currentIndex > 0 && currentIndex <= history.length) {
            $('#input').val(history[history.length - currentIndex]);
        } else if (currentIndex == 0) {
            currentIndex = 0;
            $('#input').val(currentText);
        } else {
            currentIndex = currentIndex <= 0 ? 0 : history.length;
        }
    };

    var parseMacro = function(command) {
        var fn = FNS[command];
        if (fn) {
            var r = fn();
            if (r) {
                append('<', 'out', r);
            }
        } else {
            append('<', 'err', 'Unknown function ' + command);
        }
    }

    $('#input').on('keydown', function(e) {
        const UP_ARROW = 38,
            DOWN_ARROW = 40,
            ENTER = 13;
        var command = $(this).val();
        if (e.keyCode === ENTER) {
            currentIndex = 0;
            history.push(command);
            $(this).val('');
            if (command[0] === ':') {
                parseMacro(command);
            } else {
                parse(command);
            }
        } else if (e.keyCode === DOWN_ARROW) {
            cacheCurrentText(command);
            currentIndex--;
            readHistory();
        } else if (e.keyCode === UP_ARROW) {
            cacheCurrentText(command);
            currentIndex++;
            readHistory();
        } else {
            currentIndex = 0;
        }
        e.stopPropagation();
    }).focus();
};

