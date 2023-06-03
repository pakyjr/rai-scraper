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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RaiScraperV2 = void 0;
const const_1 = require("./const");
const baseRai_1 = require("./baseRai");
class RaiScraperV2 extends baseRai_1.BaseRaiScraper {
    constructor() {
        super();
    }
    fetchChannelData(scrapingDates, channelsToScrape, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            let promiseGenerators = [];
            this.fillGeneratorArray(promiseGenerators, channelsToScrape, this.getChannelScheduleForDays.bind(this));
            let channelPlanArray = yield this.bufferizePromises(promiseGenerators, const_1.config.bufferSize, scrapingDates, channelsToScrape, templateChannelProgram);
            console.log("Ending Scraper for Channel");
            return channelPlanArray;
        });
    }
    /**
     * @description will fill a Channel Plan object, which contains the channel info and the schedules for that channel.
     * @param scrapingDates how many schedules to scrape (each schedule is a day).
     * @param channel which channel to get the schedules.
     * @returns a Promise that will resolve with a Channel Plan object.
     */
    bufferizePromises(promiseGenerators, bufferSize, scrapingDates, channels, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            let allPromises = [];
            let buffer = [];
            for (let i = 0; i < channels.length; i++) {
                let currentPromise = promiseGenerators[i](scrapingDates, channels[i], templateChannelProgram);
                currentPromise.finally(() => {
                    buffer.splice(buffer.indexOf(currentPromise), 1);
                });
                buffer.push(currentPromise);
                allPromises.push(currentPromise);
                if (buffer.length >= bufferSize) {
                    const winnerPromise = yield Promise.race(buffer);
                    const index = buffer.findIndex((element) => __awaiter(this, void 0, void 0, function* () { return (yield element).channel.id === winnerPromise.channel.id; }));
                }
            }
            return Promise.all(allPromises);
        });
    }
    /**
     * @description will fill an array with uninitiated functions that returns a promise.
     * @param promiseGenerators is the array to be filled
     * @param channels is an array of ChannelInfo
     * @param getChannelScheduleForDays is the function that will fill the array.
     * @returns the filled array
    */
    fillGeneratorArray(promiseGenerators, channels, getChannelScheduleForDays) {
        for (let i = 0; i < channels.length; i++) {
            promiseGenerators.push(getChannelScheduleForDays);
        }
        return promiseGenerators;
    }
    getChannelScheduleForDays(scrapingDates, channel, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            let channelPlan = { channel: channel, plan: [] };
            for (const date of scrapingDates) {
                let planSingleDate = yield this.fillPlanObj(date, channel, templateChannelProgram);
                channelPlan.plan.push(planSingleDate);
            }
            return channelPlan;
        });
    }
}
exports.RaiScraperV2 = RaiScraperV2;
//# sourceMappingURL=raiV1.js.map