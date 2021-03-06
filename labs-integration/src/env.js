const { Exp, Dimensions, Multipliers, Util } = require('labs-core');
const { UNITS } = Dimensions;
const { MULTIPLIERS } = Multipliers;
const Latex = require('./latex');
const _ = require('lodash');
const Decimal = require('decimal.js');

let Env = (function() {

    var Numbers = (function() {
        return {
            is: function(n) {
                return /^[\+\-]?\d*\.?\d*$/.test(n);
            }
        };
    })();

    var build = Util.build;
    var remove = Util.remove;

    var defaultMultiplier = function(unit) {
        return unit.name === 'Grama' ? 'k' : '';
    };

    var validateName = function(name) {
        if (!name.match(/^[_a-zA-Z]+[a-zA-Z0-9_]*$/)) {
            throw 'Invalid variable name (must start with letter or underscore and then also allowing numbers): ' + name;
        }
        if (name.startsWith('delta_')) {
            throw 'Variable names cannot start with "delta_"; those are reserved for the errors: ' + name;
        }
    };

    var validateDeps = function(deps) {
        while (Object.keys(deps).length > 0) {
            var nodeps = Object.keys(deps).find(function(k) {
                return deps[k].length === 0;
            });
            if (!nodeps) {
                throw 'Circular dependency or unknown variable found: ' + JSON.stringify(deps);
            }
            delete deps[nodeps];
            Object.keys(deps).forEach(function(d) {
                remove(deps[d], nodeps);
            });
        }
    };

    var Env = function(vars, consts) {
        this.consts = consts || {};
        this.vars = build(vars, ['name', 'unit', 'formula', 'values'], [undefined, '', undefined, []])
        var deps = {};
        Object.keys(this.consts).forEach(function(constant) {
            validateName(constant);
            this.consts[constant].name = this.consts[constant].latexName || this.consts[constant].name || constant;
            if (this.consts[constant].formula) {
                this.consts[constant].formula = Exp.parse(this.consts[constant].formula);
                var deps = this.consts[constant].formula.deps();
                deps.forEach(function (dep) {
                    if (!this.consts[dep]) {
                        throw 'Constant ' + constant + ' depends on unknown constant: ' + dep;
                    }
                }.bind(this));
            }
        }.bind(this));
        Object.keys(this.vars).forEach(function(variable) {
            validateName(variable);
            this.vars[variable].values = this.vars[variable].values || [];
            if (this.consts[variable]) {
                throw 'Invalid variable name, there is already a constant with that name: ' + variable;
            }
            if (this.vars[variable].formula) {
                this.vars[variable].formula = Exp.parse(this.vars[variable].formula);
                deps[variable] = this.vars[variable].formula.deps();
                deps[variable] = deps[variable].filter(function (dep) {
                    return !this.consts[dep];
                }.bind(this));
            } else {
                deps[variable] = [];
            }
        }.bind(this));
        validateDeps(deps);
    };

    Env.prototype.addValues = function(variable, list) {
        this.vars[variable].values = this.vars[variable].values.concat(list);
    };

    Env.prototype.add = function(name, list, errorOrMultiplier, error) {
        var variable = this.vars[name];
        if (!variable) {
            throw 'Variable name \'' + name + '\' not found in vars list.';
        }
        if (variable.formula) {
            throw 'Variable name \'' + name + '\' has a formula associated with it, so you cannot add values.';
        }

        var multiplier = errorOrMultiplier;
        if (errorOrMultiplier && Numbers.is(errorOrMultiplier)) {
            error = errorOrMultiplier;
            multiplier = '';
        }
        multiplier = multiplier || defaultMultiplier(variable.unit);
        error = error || 0;

        list = list.map(function(el) {
            if (!Array.isArray(el)) {
                el = [el];
            }

            var value = {
                value: el[0],
                multiplier: el[1],
                error: el[2]
            };
            if (value.multiplier && Numbers.is(value.multiplier)) {
                value.error = value.multiplier;
                value.multiplier = undefined;
            }

            value.multiplier = value.multiplier || multiplier;
            value.error = value.error || error;

            return value;
        });

        this.addValues(name, list);
    };

    Env.findMultipler = function(value) {
        var expoent = value.e;
        if (expoent >= -2 && expoent <= 2) {
            // prioritize no multiplier for nicer looking tables
            return MULTIPLIERS[''];
        }
        return Util.values(MULTIPLIERS).sort(function(v1, v2) {
            return parseInt(v2.multiplier) - parseInt(v1.multiplier);
        }).find(function(v) {
            return v.multiplier <= expoent;
        }) || MULTIPLIERS.y;
    };

    Env.prototype.parse = function(values) {
        return values.map(function(v) {
            var multiplier = Env.findMultipler(v.error);
            var m = new Decimal(10).pow(parseInt(multiplier.multiplier));

            var error = v.error.dividedBy(m).toSD(1);
            var value = v.value.dividedBy(m);

            if (error.eq(0)) {
                return { value : value.toString(), error : 0, multiplier : multiplier.key };
            }

            var fixedValue = value.toFixed(error.decimalPlaces());
            if (error.gt(1)) {
                var trailingZeroes = (/^[^0]*(0*)$/g).exec(error.toFixed())[1];
                if (fixedValue.length <= trailingZeroes.length) {
                    fixedValue = '0';
                } else {
                    fixedValue = fixedValue.substring(0, fixedValue.length - trailingZeroes.length) + trailingZeroes;
                }
            }

            return { value: fixedValue, error: error.toFixed(), multiplier: multiplier.key };
        }.bind(this));
    };

    Env.prototype.get = function(name) {
        var variable = this.vars[name];
        if (!variable) {
            throw 'Variable name \'' + name + '\' not found in vars list.';
        }

        return this.parse(this.fetchValues(variable));
    };

    Env.prototype.table = function(names) {
        var size;
        var table = _.unzip(names.map(function(name) {
            var variable = this.vars[name];
            if (!variable) {
                throw 'Variable name \'' + name + '\' not found in vars list.';
            }
            var values = this.fetchValues(variable);
            if (size && values.length !== size) {
                throw 'Incompatible variables, differente sizes: ' + values.length + ' != ' + size + ' (for ' + variable.name + ').';
            } else {
                size = values.length;
            }

            return this.parse(values);
        }.bind(this)));
        return table;
    };

    Env.prototype.latexTable = function(names) {
        return Latex.latexTable(names, this);
    };

    Env.prototype.error = function(variable) {
        var formula = variable.formula;
        var exp = function(base, pow) {
            return Exp.call('^', [base, Exp.literal(pow)]);
        }
        var partials = formula.deps().map(function(dep) {
            return Exp.call('*', [exp(formula.derivative(dep), 2), exp(Exp.identifier('delta_' + dep), 2)]);
        });
        return exp(Exp.call('+', partials), .5);
    };

    Env.prototype.fetchConstant = function (constant) {
        if (!constant.formula) {
            var ms = constant.multiplier || '';
            var m = new Decimal(10).pow(parseInt(MULTIPLIERS[ms].multiplier));
            return {
                value: new Decimal(constant.value).times(m),
                error: new Decimal(constant.error).times(m)
            };
        }
        var deps = constant.formula.deps();
        var mapi = {};
        deps.map(function (dep) {
            var depValue = this.fetchConstant(this.consts[dep]);
            mapi[dep] = depValue.value;
            mapi['delta_' + dep] = depValue.error;
        }.bind(this));
        return {
            value: constant.formula.getValue(mapi),
            error: this.error(constant).getValue(mapi)
        };
    };

    Env.prototype.fetchValues = function(variable) {
        if (!variable.formula) {
            return variable.values.map(function(v) {
                var m = new Decimal(10).pow(parseInt(MULTIPLIERS[v.multiplier].multiplier));
                return {
                    value: new Decimal(v.value).times(m),
                    error: new Decimal(v.error).times(m)
                };
            });
        }

        var map = {};
        variable.formula.deps().forEach(function(dep) {
            if (this.consts[dep]) {
                map[dep] = this.fetchConstant(this.consts[dep]);
            } else {
                map[dep] = this.fetchValues(this.vars[dep]);
            }
        }.bind(this));

        var sizes = Object.keys(map).filter(function (dep) {
            return Array.isArray(map[dep]);
        }).map(function(dep) {
            return map[dep].length;
        }).sort();

        if (sizes[0] !== sizes[sizes.length - 1]) {
            throw 'Incompatible datasets';
        }

        var i, size = sizes[0];
        var mapis = [];
        for (i = 0; i < size; i++) {
            var mapi = {};
            Object.keys(map).forEach(function(dep) {
                var depOrConst = Array.isArray(map[dep]) ? map[dep][i] : map[dep];
                mapi[dep] = depOrConst.value;
                mapi['delta_' + dep] = depOrConst.error;
            });
            mapis.push(mapi);
        }

        var error = this.error(variable).simplify();

        return mapis.map(function(mapi) {
            return {
                value: variable.formula.getValue(mapi),
                error: error.getValue(mapi)
            };
        });
    };

    Env.prototype.fetchUnit = function(variable) {
        if (true || !variable.formula) {
            return variable.unit;
        }

        var units = {};
        variable.formula.deps().forEach(function(dep) {
            var depV = this.consts[dep] || this.vars[dep];
            units[dep] = this.fetchUnit(depV);
        }.bind(this));

        return variable.formula.unit(units);
    };

    Env.prototype.deps = function(name) {
        var variable = this.vars[name];
        var ast = jsep(variable.formula);
        return Exp.deps(ast);
    };

    Env.prototype.obj = function (id) {
        return this.vars[id] || this.constants[id];
    }

    Env.prototype.name = function (id) {
        return this.obj(id).name;
    };

    Env.prototype.desc = function (id) {
        return this.obj(id).description || 'no desc';
    };

    Env.prototype.fullLatexTable = function (names, caption, label) {
        return Latex.fullLatexTable(names, caption, label, this);
    };

    Env.prototype.originTable = function (args) {
        let headers = args.map(arg => arg + '\te' + arg).join('\t') + '\n';
        return headers + this.table(args).map(row => row.map(el => {
            let ms = el.multiplier;
            let m = new Decimal(10).pow(parseInt(MULTIPLIERS[ms].multiplier));
            return (m*el.value) + '\t' + (m*el.error);
        }).join("\t")).join("\n");
    };

    return Env;
})();

module.exports = Env;
