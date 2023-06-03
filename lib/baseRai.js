"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.BaseRaiScraper = void 0;
const const_1 = require("./const");
const utils = __importStar(require("./networkhandler"));
const createCsvWriter = __importStar(require("csv-writer"));
const utils_1 = require("./utils");
const fs = __importStar(require("fs"));
class BaseRaiScraper {
    constructor() {
        this.networkHandler = new utils.networkHandler();
    }
    /**
      *@description core function that does the scraping.
     * @param daysToScrape each schedule has the programs for the whole day, it sets the amount of schedules to get.
     * @param numOfChannelsToScrape amount of channels to have their schedules scraped.
     * @returns void, it creates in output a folder for each channel with the program schedules formatted in a csv file. It creates a csv for each day.
     */
    startScraping(daysToScrape, numOfChannelsToScrape) {
        return __awaiter(this, void 0, void 0, function* () {
            let start = Date.now();
            let scrapingDates = (0, utils_1.getFormattedDates)(daysToScrape);
            const dataConfig = yield this.networkHandler.get(const_1.configRaiUrl);
            const templateChannelProgram = dataConfig.palinsestoService.canaleGiorno;
            const channelDetails = yield this.networkHandler.get(dataConfig.channelsDetail);
            let channels = this.parseChannelsInfo(channelDetails);
            const channelsToScrape = channels.splice(1, numOfChannelsToScrape);
            let channelPlanArray = yield this.fetchChannelData(scrapingDates, channelsToScrape, templateChannelProgram);
            yield this.saveDataOnCsv(channelPlanArray);
            let end = Date.now();
            console.log(`Elapsed time: ${(end - start) / 1000}s`);
        });
    }
    /**
     * @description will fill an object with the date information, and with an array filled with the programs of the day's schedule.
     * @returns a Promise of a Plan Object.
     */
    fillPlanObj(date, channel, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            let planObj = {
                date: date,
                events: [],
            };
            try {
                let programmazione = yield this.getChannelSchedule(date, channel, templateChannelProgram);
                planObj.events = programmazione;
            }
            catch (error) {
                console.error(`Error get plan ${date} - ${channel.name}`);
            }
            return planObj;
        });
    }
    /**
     * @description will do the http get and parse the schedule info of a single channel.
     * @param date single date
     * @param channel info of a single channel.
     * @param templateChannelProgram will be filled with the proper channel data and will do a http get of the info.
     * @returns using the parseChannelProgram info, will parse and return the schedule of a single channel
     */
    getChannelSchedule(date, channel, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            let programmazione = [];
            const channelProgramUrl = templateChannelProgram.replace("[nomeCanale]", channel.code).replace("[dd-mm-yyyy]", date).replace("/old", "");
            const currentChannelProgramJSON = yield this.networkHandler.get(channelProgramUrl);
            programmazione = this.parseChannelProgram(currentChannelProgramJSON);
            return programmazione;
        });
    }
    /**
     * @description parses the information of the programs in the json in an array of ProgramInfo objects. For a single channel that will be passed in the getChannelSchedule function
     * @param currentChannelProgramJSON schedule for single channel
     * @returns parsed info stored in an object of each single program in the schedule.
     */
    parseChannelProgram(currentChannelProgramJSON) {
        let programmazione = [];
        for (let i = 0; i < currentChannelProgramJSON.events.length; i++) {
            const singleInputCurrentChannel = currentChannelProgramJSON.events[i];
            const newProgram = {
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
    parseChannelsInfo(channelDetails) {
        //prende una lista di canali da channelsDetail e crea un oggetto con i metodi id, name, code
        let channels = [];
        for (let i = 0; i < channelDetails.dirette.length; i++) {
            const singleInputChannelInfo = channelDetails.dirette[i];
            const newChannel = {
                id: singleInputChannelInfo.ID,
                name: singleInputChannelInfo.channel,
                code: singleInputChannelInfo.channel.replace(/ /gi, ""),
            };
            channels.push(newChannel);
        }
        return channels;
    }
    /**
     * @param allChannelPlan An array of ChannelPlan
     * @returns folders for how many elents are in the array passed to the function, in which each one will contain a csv file filled with the parsed data.
     */
    saveDataOnCsv(allChannelPlan) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const channelPlan of allChannelPlan) {
                for (const singlePlan of channelPlan.plan) {
                    yield this.saveCsvSinglePlan(channelPlan.channel, singlePlan.date, singlePlan.events);
                }
            }
        });
    }
    saveCsvSinglePlan(channel, date, events) {
        return __awaiter(this, void 0, void 0, function* () {
            const folderName = '../csv';
            const folderNam2 = `../csv/${channel.code}`;
            let formattedCPA = [];
            for (let singleEvent in events) {
                let formattedChannelPlan = {
                    channel: channel.name,
                    date: date,
                    hour: events[singleEvent].hour,
                    event: events[singleEvent].name
                };
                formattedCPA.push(formattedChannelPlan);
            }
            try {
                if (!fs.existsSync(folderName)) {
                    fs.mkdirSync(folderName);
                }
                if (fs.existsSync(folderName)) {
                    if (!fs.existsSync(folderNam2)) {
                        fs.mkdirSync(folderNam2);
                    }
                }
            }
            catch (error) {
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
            yield csvWriter.writeRecords(formattedCPA);
        });
    }
}
exports.BaseRaiScraper = BaseRaiScraper;
//# sourceMappingURL=baseRai.js.map