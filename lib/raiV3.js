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
exports.RaiScraperV3 = void 0;
const const_1 = require("./const");
const baseRai_1 = require("./baseRai");
class RaiScraperV3 extends baseRai_1.BaseRaiScraper {
    constructor() {
        super();
    }
    fetchChannelData(scrapingDates, channelsToScrape, templateChannelProgram) {
        var _a, e_1, _b, _c;
        return __awaiter(this, void 0, void 0, function* () {
            let arrayOfPlanPromises = [];
            try {
                for (var _d = true, _e = __asyncValues(this.concurrencyPromiseHandler(scrapingDates, channelsToScrape, templateChannelProgram, const_1.config.bufferSize)), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                    _c = _f.value;
                    _d = false;
                    try {
                        const res = _c;
                        if (!Array.isArray(res)) {
                            arrayOfPlanPromises.push(res);
                        }
                        else {
                            arrayOfPlanPromises.push(...res);
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
            let channelPlanArray = this.parseChannelPlanArray(channelsToScrape, scrapingDates, arrayOfPlanPromises);
            console.log("Ending Scraper with Generator");
            return channelPlanArray;
        });
    }
    concurrencyPromiseHandler(scrapingDates, channels, templateChannelProgram, concurrency) {
        return __asyncGenerator(this, arguments, function* concurrencyPromiseHandler_1() {
            let buffer = [];
            for (const singleChannel of channels) {
                for (const date of scrapingDates) {
                    let promisePlanSingleDate = this.fillPlanObj(date, singleChannel, templateChannelProgram);
                    promisePlanSingleDate.finally(() => {
                        buffer.splice(buffer.indexOf(promisePlanSingleDate), 1);
                    });
                    buffer.push(promisePlanSingleDate);
                    if (buffer.length >= concurrency) {
                        yield yield __await(Promise.race(buffer));
                    }
                }
            }
            yield yield __await(Promise.all(buffer));
        });
    }
    parseChannelPlanArray(channelsToScrape, scrapingDates, arrayOfPlanPromises) {
        let channelPlanArray = [];
        for (let i = 0; i < channelsToScrape.length; i++) {
            channelPlanArray[i] = { channel: channelsToScrape[i], plan: [] };
            for (let j = 0; j < scrapingDates.length; j++) {
                channelPlanArray[i].plan.push(arrayOfPlanPromises[j]);
            }
        }
        return channelPlanArray;
    }
}
exports.RaiScraperV3 = RaiScraperV3;
//# sourceMappingURL=raiV3.js.map