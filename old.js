if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    var list = Object(this);
    var length = list.length >>> 0;
    var thisArg = arguments[1];
    var value;

    for (var i = 0; i < length; i++) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return undefined;
  };
}

var MULTIPLIER = {
  'n' : Math.pow(10, -9),
  'u' : Math.pow(10, -6),
  'm' : Math.pow(10, -3),
  '' : Math.pow(10, 0)
};

function m(unity) {
  return MULTIPLIER[unity.charAt(0)];
}

function toLatex(number, error, baseUnity) {
  var adequatedMultiplier = Object.keys(MULTIPLIER).find(function (m) {
    return number < MULTIPLIER[m];
  });
  var coefficient = MULTIPLIER[adequatedMultiplier];
  var multiplierName = adequatedMultiplier === 'u' ? '\\mu ' : adequatedMultiplier;
  return toLatexRaw(number / coefficient, error / coefficient) + ' ' + multiplierName + baseUnity;
}

function toLatexRaw(number, error, significantFigures) {
  // Return a number with desired significant figures
  // e.g. =sigfig(123.56,2) returns 120
  function sigfig(num, significantFigures) {
    return num.toPrecision(significantFigures) * 1;
  }
  
  function decimalPlaces(number) {
    // toFixed produces a fixed representation accurate to 20 decimal places
    // without an exponent.
    // The ^-?\d*\. strips off any sign, integer portion, and decimal point
    // leaving only the decimal fraction.
    // The 0+$ strips off any trailing zeroes.
    return ((+number).toFixed(18)).replace(/^-?\d*\.?|0+$/g, '').length;
  }
  
  function sameAs(num, errorf) {
    var decPlaces = decimalPlaces(errorf);
    return num.toFixed(decPlaces);
  }
  
  significantFigures = significantFigures || 1;
  if (number === '-' || error === '-') {
    return '-';
  }
  var errorf = sigfig(error, significantFigures);
  var numf = sameAs(number, errorf);
  var errorff = errorf.toFixed(decimalPlaces(errorf));
  return '$ ' + numf + ' \\pm ' + errorff + ' $';
}

function listLatex() {
  var args = Array.prototype.slice.call(arguments);
  return args.join(' & ') + ' \\\\';
}

var p = Math.pow;