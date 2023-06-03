import { config } from "./const";
import { ChannelInfo, Plan, ChannelPlan, PromiseGeneratorsFn } from "./types";
import { BaseRaiScraper } from "./baseRai";


export class RaiScraperV2 extends BaseRaiScraper {

    constructor() {
        super();
    }

    public async fetchChannelData(scrapingDates: string[], channelsToScrape: ChannelInfo[], templateChannelProgram: string): Promise<ChannelPlan[]> {

        let promiseGenerators: PromiseGeneratorsFn[] = [];

        this.fillGeneratorArray(promiseGenerators, channelsToScrape, this.getChannelScheduleForDays.bind(this));
        let channelPlanArray: ChannelPlan[] = await this.bufferizePromises(promiseGenerators, config.bufferSize, scrapingDates, channelsToScrape, templateChannelProgram);

        console.log("Ending Scraper for Channel")
        return channelPlanArray;
    }

    /**
     * @description will fill a Channel Plan object, which contains the channel info and the schedules for that channel.
     * @param scrapingDates how many schedules to scrape (each schedule is a day).
     * @param channel which channel to get the schedules. 
     * @returns a Promise that will resolve with a Channel Plan object. 
     */
    private async bufferizePromises(promiseGenerators: PromiseGeneratorsFn[], bufferSize: number, scrapingDates: string[], channels: ChannelInfo[], templateChannelProgram: string) {

        let allPromises: Promise<ChannelPlan>[] = [];
        let buffer: Promise<ChannelPlan>[] = [];

        for (let i = 0; i < channels.length; i++) {
            let currentPromise = promiseGenerators[i](scrapingDates, channels[i], templateChannelProgram);
            currentPromise.finally(() => {
                buffer.splice(buffer.indexOf(currentPromise), 1)
            })
            buffer.push(currentPromise);
            allPromises.push(currentPromise);
            if (buffer.length >= bufferSize) {
                const winnerPromise = await Promise.race(buffer)
                const index = buffer.findIndex(async element => (await element).channel.id === winnerPromise.channel.id);
            }
        }
        return Promise.all(allPromises);
    }

    /** 
     * @description will fill an array with uninitiated functions that returns a promise. 
     * @param promiseGenerators is the array to be filled
     * @param channels is an array of ChannelInfo
     * @param getChannelScheduleForDays is the function that will fill the array.
     * @returns the filled array
    */
    private fillGeneratorArray(promiseGenerators: PromiseGeneratorsFn[], channels: ChannelInfo[], getChannelScheduleForDays: PromiseGeneratorsFn) {
        for (let i = 0; i < channels.length; i++) {
            promiseGenerators.push(getChannelScheduleForDays);
        }
        return promiseGenerators;
    }

    private async getChannelScheduleForDays(scrapingDates: string[], channel: ChannelInfo, templateChannelProgram: string): Promise<ChannelPlan> {
        let channelPlan: ChannelPlan = { channel: channel, plan: [] };

        for (const date of scrapingDates) {
            let planSingleDate: Plan = await this.fillPlanObj(date, channel, templateChannelProgram);
            channelPlan.plan.push(planSingleDate);
        }

        return channelPlan;
    }


}