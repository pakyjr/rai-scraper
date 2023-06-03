"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testPromiseRace = void 0;
function testPromiseRace() {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        const promiseGeneratorArray = [];
        const promiseAmount = 5;
        const promiseAtTime = 2;
        const timeOutArray = [2000, 1000, 3500, 1500, 3500];
        const start = Date.now();
        // for (let index = 0; index < promiseAmount; index++) {
        //     promiseGeneratorArray.push(() => examplePromise(index, timeOutArray[index]));
        // }
        console.log(`Start Time ${start}`);
        // const allResults = genericFunctionsPromiseBufferV3(promiseAtTime, timeOutArray);
        let allPromises = [];
        try {
            for (var _d = true, _e = __asyncValues(genericFunctionsPromiseBufferV3(promiseAtTime, timeOutArray)), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const res = _c;
                    if (!Array.isArray(res)) {
                        allPromises.push(res);
                    }
                    else {
                        allPromises.push(...res);
                    }
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        console.log(allPromises);
        const end = Date.now();
        console.log(`End Time - ${end}`);
        console.log(`Elapsed Time - ${end - start}`);
        // console.log(allResults);
        console.log(`Fine`);
    });
}
exports.testPromiseRace = testPromiseRace;
function genericFunctionsPromiseBuffer(promiseGeneratorArray, promiseAtTime) {
    return __awaiter(this, void 0, void 0, function* () {
        // let buffer: Promise<T>[] = [];
        let buffer = [];
        let allPromises = [];
        let promiseAmount = promiseGeneratorArray.length;
        let runningPromises = 0;
        for (let i = 0; i < promiseAmount; i++) {
            if (runningPromises < 5) {
                buffer.push(promiseGeneratorArray[i]());
                runningPromises += 1;
            }
            if (runningPromises >= promiseAtTime) {
                const winnerPromise = yield Promise.race(buffer);
                const index = buffer.findIndex((element) => __awaiter(this, void 0, void 0, function* () { return (yield element).guid === winnerPromise.guid; }));
                allPromises.push(...buffer.splice(index, 1));
                runningPromises -= 1;
            }
        }
        allPromises.push(...buffer);
        let res = yield Promise.all(allPromises);
        return res;
    });
}
function genericFunctionsPromiseBufferV2(promiseGeneratorArray, bufferSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const buffer = [];
        let allPromises = [];
        let promiseAmount = promiseGeneratorArray.length;
        for (let i = 0; i < promiseAmount; i++) {
            let currentPromise = promiseGeneratorArray[i]();
            currentPromise.finally(() => {
                buffer.splice(buffer.indexOf(currentPromise), 1);
            });
            buffer.push(currentPromise);
            allPromises.push(currentPromise);
            if (buffer.length >= bufferSize) {
                yield Promise.race(buffer);
            }
        }
        let res = yield Promise.all(allPromises);
        return res;
    });
}
function genericFunctionsPromiseBufferV3(concurrency, timeOutArray) {
    return __asyncGenerator(this, arguments, function* genericFunctionsPromiseBufferV3_1() {
        let promiseArray = [];
        for (let i = 0; i < timeOutArray.length; i++) {
            let currentPromise = examplePromise(i, timeOutArray[i]);
            currentPromise.finally(() => {
                promiseArray.splice(promiseArray.indexOf(currentPromise), 1);
            });
            promiseArray.push(currentPromise);
            if (promiseArray.length >= concurrency) {
                yield yield __await(Promise.race(promiseArray));
            }
        }
        yield yield __await(Promise.all(promiseArray));
    });
}
function examplePromise(val, timeout) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Start - ${val + 1}`);
        yield new Promise(resolve => setTimeout(resolve, timeout));
        console.log(`End - ${val + 1}`);
        return {
            guid: val.toString()
        };
    });
}
//# sourceMappingURL=test.js.map