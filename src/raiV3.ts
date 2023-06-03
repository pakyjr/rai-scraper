import { config } from "./const";
import { ChannelInfo, Plan, ChannelPlan } from "./types";
import { BaseRaiScraper } from "./baseRai";


export class RaiScraperV3 extends BaseRaiScraper {

    constructor() {
        super()
    }

    public async fetchChannelData(scrapingDates: string[], channelsToScrape: ChannelInfo[], templateChannelProgram: string): Promise<ChannelPlan[]> {

        let arrayOfPlanPromises: Plan[] = [];

        for await (const res of this.concurrencyPromiseHandler(scrapingDates, channelsToScrape, templateChannelProgram, config.bufferSize)) {

            if (!Array.isArray(res)) {
                arrayOfPlanPromises.push(res);
            } else {
                arrayOfPlanPromises.push(...res);
            }
        }
        let channelPlanArray: ChannelPlan[] = this.parseChannelPlanArray(channelsToScrape, scrapingDates, arrayOfPlanPromises);

        console.log("Ending Scraper with Generator")
        return channelPlanArray;
    }

    private async* concurrencyPromiseHandler(scrapingDates: string[], channels: ChannelInfo[], templateChannelProgram: string, concurrency: number) {
        let buffer: Promise<Plan>[] = [];
        for (const singleChannel of channels) {
            for (const date of scrapingDates) {
                let promisePlanSingleDate: Promise<Plan> = this.fillPlanObj(date, singleChannel, templateChannelProgram);

                promisePlanSingleDate.finally(() => {
                    buffer.splice(buffer.indexOf(promisePlanSingleDate), 1)
                })

                buffer.push(promisePlanSingleDate);

                if (buffer.length >= concurrency) {
                    yield Promise.race(buffer);
                }
            }
        }

        yield Promise.all(buffer)
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

