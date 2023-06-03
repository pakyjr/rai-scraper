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
exports.RaiScraper = void 0;
const const_1 = require("./const");
const utils = __importStar(require("./networkhandler"));
const createCsvWriter = __importStar(require("csv-writer"));
const utils_1 = require("./utils");
const fs = __importStar(require("fs"));
class RaiScraper {
    constructor() {
        this.networkHandler = new utils.networkHandler();
    }
    startScraping(daysToScrape, numOfChannelsToScrape) {
        return __awaiter(this, void 0, void 0, function* () {
            let channels = [];
            let scrapingDates = (0, utils_1.getFormattedDates)(daysToScrape);
            const dataConfig = yield this.networkHandler.get(const_1.configRaiUrl);
            const templateChannelProgram = dataConfig.palinsestoService.canaleGiorno;
            const channelDetails = yield this.networkHandler.get(dataConfig.channelsDetail);
            channels = this.parseChannelsInfo(channelDetails);
            const channelsToScrape = channels.splice(0, numOfChannelsToScrape);
            const promiseArray = [];
            let promiseGenerators = [];
            this.fillGeneratorArray(promiseGenerators, channelsToScrape, this.getChannelScheduleForDays);
            console.log(promiseGenerators);
            this.bufferizePromises(promiseGenerators, 5, promiseArray, scrapingDates, channelsToScrape, templateChannelProgram);
            console.log(promiseArray);
            // const allChannelPlan: ChannelPlan[] = await this.promiseBuffer(promiseArray, config.bufferSize);
            // await this.saveDataOnCsv(allChannelPlan);
        });
    }
    bufferizePromises(promiseGenerators, bufferSize, processedPromises, scrapingDates, channels, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            // return Promise.all(processedPromises)
            for (let i = 0; i < channels.length + bufferSize; i++) {
                if (i < bufferSize) {
                    processedPromises.push(promiseGenerators[i](scrapingDates, channels[i], templateChannelProgram));
                    continue;
                }
                if (i >= bufferSize) {
                    const winnerPromise = yield Promise.race(processedPromises);
                    const index = processedPromises.findIndex((element) => __awaiter(this, void 0, void 0, function* () { return (yield element).channel.id === winnerPromise.channel.id; }));
                    processedPromises.splice(index, 1);
                    if (i < channels.length)
                        processedPromises.push(promiseGenerators[i](scrapingDates, channels[i], templateChannelProgram));
                }
            }
            return Promise.all(processedPromises);
        });
    }
    fillGeneratorArray(promiseGenerators, channels, getChannelScheduleForDays) {
        for (let i = 0; i < channels.length; i++) {
            promiseGenerators.push(getChannelScheduleForDays);
        }
        return promiseGenerators;
    }
    getChannelScheduleForDays(scrapingDates, channel, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            let channelPlan = {
                channel: channel,
                plan: [],
            };
            for (const date of scrapingDates) {
                let planSingleDate = yield this.fillPlanObj(date, channel, templateChannelProgram);
                channelPlan.plan.push(planSingleDate);
            }
            return channelPlan;
        });
    }
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
    getChannelSchedule(date, channel, templateChannelProgram) {
        return __awaiter(this, void 0, void 0, function* () {
            let programmazione = [];
            const channelProgramUrl = templateChannelProgram.replace("[nomeCanale]", channel.code).replace("[dd-mm-yyyy]", date).replace("/old", "");
            const currentChannelProgramJSON = yield this.networkHandler.get(channelProgramUrl);
            programmazione = this.parseChannelProgram(currentChannelProgramJSON);
            return programmazione;
        });
    }
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
    // async promiseBuffer(promiseArray: Promise<ChannelPlan>[], bufferSize: number): Promise<ChannelPlan[]> {
    //     let buffer: Promise<ChannelPlan>[] = promiseArray.splice(0, bufferSize);
    //     let allPromises: ChannelPlan[] = [];
    //     while (promiseArray.length > 0 || buffer.length > 0) {
    //         const singlePromise: ChannelPlan = await Promise.race(buffer);
    //         for(const index in buffer){
    //             if(singlePromise.channel.id === (await buffer[index]).channel.id){
    //                 buffer.splice(parseInt(index), 1);
    //                 if(buffer.length < bufferSize){
    //                     break;
    //                 }
    //             }
    //         }
    //         if (promiseArray.length > 0) {
    //             buffer.push(promiseArray.shift()!);
    //         }
    //         allPromises.push(singlePromise);
    //     }
    //     return allPromises;
    // }
    promiseBuffer(promiseArray, bufferSize, index) {
        return __awaiter(this, void 0, void 0, function* () {
            let buffer = [];
            let singlePromise;
            if (promiseArray.length === buffer.length && index === buffer.length) { //attiviamo questa condizione una sola volta per fillare il buffer la prima voltax
                buffer = promiseArray.splice(0, bufferSize);
            }
            else if (buffer.length < bufferSize) {
            }
            else {
                singlePromise = yield Promise.race(buffer);
                for (const index in buffer) {
                    if (singlePromise.channel.id === (yield buffer[index]).channel.id) {
                        buffer.splice(parseInt(index), 1);
                        if (buffer.length < bufferSize) {
                            break;
                        }
                    }
                }
                if (promiseArray.length > 0) {
                    buffer.push(promiseArray.shift());
                }
                return singlePromise;
            }
        });
    }
}
exports.RaiScraper = RaiScraper;
// const bufferSize = 5;
// const promiseList: Promise<ChannelPlan>[] = [];
// function fillPromiseList() {
//     promiseList.push(
//         new Promise((resolve) => {
//             global.setTimeout(
//                 resolve,
//                 Math.random() * (5 - 3) + 3
//             );
//         });
//     )
// }
// for (let i = 0; i < bufferSize * 3; i++) {
//     fillPromiseList();
// }
// function bufferizePromises() {
//     const buffer: Promise<ChannelPlan>[] = [];
//     while (buffer.length < bufferSize && promiseList.length) {
//         const element = promiseList.pop();
//         if (!element) {
//             break;
//         }
//         element.then(() => {
//         });
//         buffer.push(element);
//     }
//     return Promise.all(buffer);
// }
//# sourceMappingURL=rai.js.map