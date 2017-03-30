EnvBuilder = (function () {
    const build = Utils.build;

    const CONSTANTS = {
        'pi': { name : '\pi', value : Math.PI, unit : '', error : 0 }
    };

    var EnvBuilder = function () {
        this.vars = {};
        this.consts = {};
    }

    EnvBuilder.prototype.var = function (name, latex, unit, formula) {
        this.vars[name] = [latex, unit, formula];
    };

    EnvBuilder.prototype.constant = function (name, latex, value, error, unit) {
        this.consts[name] = [latex, value, error, unit];
    };

    EnvBuilder.prototype.build = function () {
        var vars = this.vars;
        var consts = build(this.consts, ['name', 'value', 'error', 'unit'], [undefined, undefined, 0, '']);
        Object.keys(CONSTANTS).forEach(function (constant) {
            if (!(consts[constant]) && !(vars[constant])) {
                consts[constant] = CONSTANTS[constant];
            }
        });
        return new Env(vars, consts);
    };

    return EnvBuilder;
})();