EnvBuilder = (function () {
    const build = Utils.build;

    const CONSTANTS = {
        'pi': { name : '\pi', value : Math.PI, error : 0 }
    };

    var EnvBuilder = function () {
        this.vars = {};
        this.consts = {};
    }

    EnvBuilder.prototype.var = function (name, latex, unit, formula) {
        this.vars[name] = [latex, unit, formula];
    };

    EnvBuilder.prototype.constant = function (name, latex, value, error) {
        this.consts[name] = [latex, value, error];
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