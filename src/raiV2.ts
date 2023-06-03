import { config } from "./const";
import { ChannelInfo, Plan, ChannelPlan } from "./types";
import { BaseRaiScraper } from "./baseRai";

export class RaiScraperV1 extends BaseRaiScraper {

    constructor() {
        super()
    }

    public async fetchChannelData(scrapingDates: string[], channelsToScrape: ChannelInfo[], templateChannelProgram: string): Promise<ChannelPlan[]> {

        let arrayOfPlanPromises: Plan[] = await this.getChannelScheduleForDays(scrapingDates, channelsToScrape, templateChannelProgram, config.bufferSize);
        let channelPlanArray: ChannelPlan[] = this.parseChannelPlanArray(channelsToScrape, scrapingDates, arrayOfPlanPromises);

        console.log("Ending Scraper for each date");

        return channelPlanArray;
    }

    /**
     * @description will fill a Channel Plan object, which contains the channel info and the schedules for that channel.
     * @param scrapingDates how many schedules to scrape (each schedule is a day).
     * @param channel which channel to get the schedules. 
     * @returns a Promise that will resolve with a Channel Plan object. 
     */
    private async getChannelScheduleForDays(scrapingDates: string[], channels: ChannelInfo[], templateChannelProgram: string, bufferSize: number) {
        let arrayOfPlanPromises: Promise<Plan>[] = [];
        let buffer: Promise<Plan>[] = [];
        for (const singleChannel of channels) {
            for (const date of scrapingDates) {
                let promisePlanSingleDate: Promise<Plan> = this.fillPlanObj(date, singleChannel, templateChannelProgram);

                promisePlanSingleDate.finally(() => {
                    buffer.splice(buffer.indexOf(promisePlanSingleDate), 1)
                })

                buffer.push(promisePlanSingleDate);
                arrayOfPlanPromises.push(promisePlanSingleDate)

                if (buffer.length >= bufferSize) {
                    await Promise.race(buffer);
                }
            }
        }
        return await Promise.all(arrayOfPlanPromises);
    }

    private parseChannelPlanArray(channelsToScrape: ChannelInfo[], scrapingDates: string[], arrayOfPlanPromises: Plan[]): ChannelPlan[] {
        let channelPlanArray: ChannelPlan[] = [];

        for (let i = 0; i < channelsToScrape.length; i++) {
            channelPlanArray[i] = { channel: channelsToScrape[i], plan: [] };
            for (let j = 0; j < scrapingDates.length; j++) {
                channelPlanArray[i].plan.push(arrayOfPlanPromises[j]);
            }
        }

        return channelPlanArray;
    }
}

