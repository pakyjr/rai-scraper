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
exports.RaiScraperV1 = void 0;
const const_1 = require("./const");
const baseRai_1 = require("./baseRai");
class RaiScraperV1 extends baseRai_1.BaseRaiScraper {
    constructor() {
        super();
    }
    fetchChannelData(scrapingDates, channelsToScrape, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            let arrayOfPlanPromises = yield this.getChannelScheduleForDays(scrapingDates, channelsToScrape, templateChannelProgram, const_1.config.bufferSize);
            let channelPlanArray = this.parseChannelPlanArray(channelsToScrape, scrapingDates, arrayOfPlanPromises);
            console.log("Ending Scraper for each date");
            return channelPlanArray;
        });
    }
    /**
     * @description will fill a Channel Plan object, which contains the channel info and the schedules for that channel.
     * @param scrapingDates how many schedules to scrape (each schedule is a day).
     * @param channel which channel to get the schedules.
     * @returns a Promise that will resolve with a Channel Plan object.
     */
    getChannelScheduleForDays(scrapingDates, channels, templateChannelProgram, bufferSize) {
        return __awaiter(this, void 0, void 0, function* () {
            let arrayOfPlanPromises = [];
            let buffer = [];
            for (const singleChannel of channels) {
                for (const date of scrapingDates) {
                    let promisePlanSingleDate = this.fillPlanObj(date, singleChannel, templateChannelProgram);
                    promisePlanSingleDate.finally(() => {
                        buffer.splice(buffer.indexOf(promisePlanSingleDate), 1);
                    });
                    buffer.push(promisePlanSingleDate);
                    arrayOfPlanPromises.push(promisePlanSingleDate);
                    if (buffer.length >= bufferSize) {
                        yield Promise.race(buffer);
                    }
                }
            }
            return yield Promise.all(arrayOfPlanPromises);
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
exports.RaiScraperV1 = RaiScraperV1;
//# sourceMappingURL=raiV2.js.map