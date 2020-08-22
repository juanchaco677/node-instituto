"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
class Util {
    static empty(data) {
        return data === undefined || data == null || data === '' || data === ' ' || data === 0;
    }
    static emptyNaN(data) {
        return data === undefined || isNaN(+data) || data === null || data === '' || data === ' ' || data === 0;
    }
    static esMultiplo(numero, multiplo) {
        const resto = numero % multiplo;
        return resto === 0;
    }
}
exports.Util = Util;
//# sourceMappingURL=util.js.map