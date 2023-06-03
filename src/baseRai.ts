import { configRaiUrl, config } from "./const";
import * as utils from "./networkhandler";
import { ChannelInfo, ProgramInfo, Plan, ChannelPlan, ParsedChannelPlan, GenericItem, PromiseGeneratorsFn, Scraper } from "./types";
import * as createCsvWriter from 'csv-writer';
import { genericPromiseBuffer, getFormattedDates } from "./utils";
import * as fs from 'fs';


export abstract class BaseRaiScraper implements Scraper {

    protected networkHandler;

    constructor() {
        this.networkHandler = new utils.networkHandler();
    }

    /**
      *@description core function that does the scraping.
     * @param daysToScrape each schedule has the programs for the whole day, it sets the amount of schedules to get. 
     * @param numOfChannelsToScrape amount of channels to have their schedules scraped. 
     * @returns void, it creates in output a folder for each channel with the program schedules formatted in a csv file. It creates a csv for each day.  
     */
    public async startScraping(daysToScrape: number, numOfChannelsToScrape: number): Promise<void> {
        let start = Date.now();

        let scrapingDates: string[] = getFormattedDates(daysToScrape);
        const dataConfig: any = await this.networkHandler.get(configRaiUrl);
        const templateChannelProgram: string = dataConfig.palinsestoService.canaleGiorno;
        const channelDetails = await this.networkHandler.get(dataConfig.channelsDetail);
        let channels: ChannelInfo[] = this.parseChannelsInfo(channelDetails);
        const channelsToScrape: ChannelInfo[] = channels.splice(1, numOfChannelsToScrape);

        let channelPlanArray: ChannelPlan[] = await this.fetchChannelData(scrapingDates, channelsToScrape, templateChannelProgram);

        await this.saveDataOnCsv(channelPlanArray);

        let end = Date.now()
        console.log(`Elapsed time: ${(end - start) / 1000}s`);
    }

    abstract fetchChannelData(scrapingDates: string[], channelsToScrape: ChannelInfo[], templateChannelProgram: string): Promise<ChannelPlan[]>;

    /**
     * @description will fill an object with the date information, and with an array filled with the programs of the day's schedule. 
     * @returns a Promise of a Plan Object. 
     */
    protected async fillPlanObj(date: string, channel: ChannelInfo, templateChannelProgram: string): Promise<Plan> {
        let planObj: Plan = {
            date: date,
            events: [],
        };
        try {
            let programmazione: ProgramInfo[] = await this.getChannelSchedule(date, channel, templateChannelProgram);
            planObj.events = programmazione;
        } catch (error) {
            console.error(`Error get plan ${date} - ${channel.name}`);
        }
        return planObj;
    }

    /**
     * @description will do the http get and parse the schedule info of a single channel.
     * @param date single date
     * @param channel info of a single channel. 
     * @param templateChannelProgram will be filled with the proper channel data and will do a http get of the info.
     * @returns using the parseChannelProgram info, will parse and return the schedule of a single channel
     */
    protected async getChannelSchedule(date: string, channel: ChannelInfo, templateChannelProgram: string): Promise<ProgramInfo[]> {
        let programmazione: ProgramInfo[] = [];
        const channelProgramUrl: string = templateChannelProgram.replace("[nomeCanale]", channel.code).replace("[dd-mm-yyyy]", date).replace("/old", "");
        const currentChannelProgramJSON = await this.networkHandler.get(channelProgramUrl);
        programmazione = this.parseChannelProgram(currentChannelProgramJSON);
        return programmazione;
    }

    /**
     * @description parses the information of the programs in the json in an array of ProgramInfo objects. For a single channel that will be passed in the getChannelSchedule function
     * @param currentChannelProgramJSON schedule for single channel
     * @returns parsed info stored in an object of each single program in the schedule.
     */
    protected parseChannelProgram(currentChannelProgramJSON: any): ProgramInfo[] {
        let programmazione: ProgramInfo[] = [];
        for (let i = 0; i < currentChannelProgramJSON.events.length; i++) {
            const singleInputCurrentChannel = currentChannelProgramJSON.events[i];
            const newProgram: ProgramInfo = {
                id: singleInputCurrentChannel.id,
                name: singleInputCurrentChannel.name,
                date: singleInputCurrentChannel.date,
                hour: singleInputCurrentChannel.hour,
                duration: singleInputCurrentChannel.duration,
            };
            programmazione.push(newProgram);
        }
        return programmazione;
    }

    /**
     * @param channelDetails  info of each channel (not parsed)
     * @returns an array of objects with the parsed info of each channel
     */
    protected parseChannelsInfo(channelDetails: any): ChannelInfo[] {
        //prende una lista di canali da channelsDetail e crea un oggetto con i metodi id, name, code
        let channels: ChannelInfo[] = [];
        for (let i = 0; i < channelDetails.dirette.length; i++) {
            const singleInputChannelInfo = channelDetails.dirette[i];
            const newChannel: ChannelInfo = {
                id: singleInputChannelInfo.ID,
                name: singleInputChannelInfo.channel,
                code: (singleInputChannelInfo.channel as string).replace(/ /gi, ""),
            };
            channels.push(newChannel);
        }
        return channels;
    }

    /**
     * @param allChannelPlan An array of ChannelPlan
     * @returns folders for how many elents are in the array passed to the function, in which each one will contain a csv file filled with the parsed data.
     */
    protected async saveDataOnCsv(allChannelPlan: ChannelPlan[]): Promise<void> {
        for (const channelPlan of allChannelPlan) {
            for (const singlePlan of channelPlan.plan) {
                await this.saveCsvSinglePlan(
                    channelPlan.channel,
                    singlePlan.date,
                    singlePlan.events,
                );
            }
        }
    }

    protected async saveCsvSinglePlan(channel: ChannelInfo, date: string, events: ProgramInfo[]) {
        const folderName = '../csv'
        const folderNam2 = `../csv/${channel.code}`
        let formattedCPA: ParsedChannelPlan[] = [];

        for (let singleEvent in events) {
            let formattedChannelPlan: ParsedChannelPlan = {
                channel: channel.name,
                date: date,
                hour: events[singleEvent].hour,
                event: events[singleEvent].name
            }
            formattedCPA.push(formattedChannelPlan);
        }
        try {
            if (!fs.existsSync(folderName)) {
                fs.mkdirSync(folderName);
            }
            if (fs.existsSync(folderName)) {
                if (!fs.existsSync(folderNam2)) {
                    fs.mkdirSync(folderNam2)
                }
            }
        } catch (error) {
            console.error(error);
        }

        const csvWriter = createCsvWriter.createObjectCsvWriter({
            path: `${folderName}/${folderNam2}/${channel.code}(${date}).csv`,
            header: [
                { id: 'channel', title: 'CHANNEL' },
                { id: 'date', title: 'DATE TIME' },
                { id: 'hour', title: 'HOUR' },
                { id: 'event', title: 'EVENT' },
            ]
        });

        await csvWriter.writeRecords(formattedCPA);
    }

}