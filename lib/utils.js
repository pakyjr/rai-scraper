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
exports.genericPromiseBuffer = exports.getFormattedDates = void 0;
/**
 * @param numDays numero di giorni a paritre da now che vogliamo scrapare
 * @returns array di date formattato [dd-mm-yyyy]
 */
function getFormattedDates(numDays) {
    let dates = [];
    let myDate = new Date();
    for (let i = 0; i < numDays; i++) {
        dates[i] = convertDataToString(myDate);
        myDate.setDate(myDate.getDate() + 1);
        // console.log(dates[i]);
    }
    return dates;
}
exports.getFormattedDates = getFormattedDates;
function convertDataToString(date) {
    let day = date.getDate();
    let twoDigitDay = day.toString().padStart(2, '0');
    let month = date.getMonth() + 1;
    let twoDigitMonth = month.toString().padStart(2, '0');
    let year = date.getFullYear();
    return `${twoDigitDay}-${twoDigitMonth}-${year}`;
}
//for testing purposes. 
function genericPromiseBuffer(promiseArray, bufferSize) {
    return __awaiter(this, void 0, void 0, function* () {
        let buffer = promiseArray.splice(0, bufferSize);
        let allPromises = [];
        while (promiseArray.length > 0 || buffer.length > 0) {
            const singlePromise = yield Promise.race(buffer);
            for (const index in buffer) {
                if (singlePromise.guid === (yield buffer[index]).guid) {
                    buffer.splice(parseInt(index), 1);
                    if (buffer.length < bufferSize) {
                        break;
                    }
                }
            }
            if (promiseArray.length > 0) {
                buffer.push(promiseArray.shift());
            }
            allPromises.push(singlePromise);
        }
        return allPromises;
    });
}
exports.genericPromiseBuffer = genericPromiseBuffer;
//# sourceMappingURL=utils.js.map