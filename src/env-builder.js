var EnvBuilder = (function () {
    const build = Utils.build;

    const CONSTANTS = build({
        'pi': ['\pi', Math.PI]
    }, ['name', 'value']);

    var EnvBuilder = function () {
        this.vars = {};
        this.consts = {};
    }

    EnvBuilder.prototype.var = function (name, latex, unitOrFormula) {
        this.vars[name] = [latex, unitOrFormula];
    };

    EnvBuilder.prototype.constant = function (name, latex, value) {
        this.consts[name] = [latex, value];
    };

    EnvBuilder.prototype.build = function () {
        Object.keys(CONSTANTS).forEach(function (constant) {
            if (!(this.consts[constant]) && !(this.vars[constant])) {
                this.consts[constant] = CONSTANTS[constant];
            }
        }.bind(this));
        return new Env(this.vars, this.consts);
    };

    return EnvBuilder;
})();