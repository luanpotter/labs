const build = require('./util').build;

let Multipliers = {}; 

Multipliers.MULTIPLIERS = build({
  'H': ['+27', 'Hella'],
  'Y': ['+24', 'Yotta'],
  'Z': ['+21', 'Zetta'],
  'E': ['+18', 'Exa'],
  'P': ['+15', 'Peta'],
  'T': ['+12', 'Tera'],
  'G': ['+9', 'Giga'],
  'M': ['+6', 'Mega'],
  'k': ['+3', 'Kilo'],
  'h': ['+2', 'Hecto'],
  'da': ['+1', 'Deca'],
  '': ['0', ''],
  'd': ['-1', 'Deci'],
  'c': ['-2', 'Centi'],
  'm': ['-3', 'Mili'],
  '\\mu': ['-6', 'Micro'],
  'n': ['-9', 'Nano'],
  'p': ['-12', 'Pico'],
  'f': ['-15', 'Femto'],
  'a': ['-18', 'Atto'],
  'z': ['-21', 'Zepto'],
  'y': ['-24', 'Yocto']
}, ['multiplier', 'name']);

module.exports = Multipliers;
