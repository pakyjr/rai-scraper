import { ChannelInfo, ProgramInfo, ChannelPlan, GenericItem } from "./types";

/**
 * @param numDays numero di giorni a paritre da now che vogliamo scrapare
 * @returns array di date formattato [dd-mm-yyyy]
 */
export function getFormattedDates(numDays: number): string[] {
    let dates: string[] = [];
    let myDate: Date = new Date();

    for (let i = 0; i < numDays; i++) {
        dates[i] = convertDataToString(myDate);
        myDate.setDate(myDate.getDate() + 1);
        // console.log(dates[i]);
    }

    return dates
}

function convertDataToString(date: Date): string {
    let day: number = date.getDate();
    let twoDigitDay: string = day.toString().padStart(2, '0');
    let month: number = date.getMonth() + 1;
    let twoDigitMonth: string = month.toString().padStart(2, '0');
    let year: number = date.getFullYear();
    return `${twoDigitDay}-${twoDigitMonth}-${year}`;
}


//for testing purposes. 
export async function genericPromiseBuffer<T extends GenericItem>(promiseArray: Promise<T>[], bufferSize: number): Promise<T[]> {
    let buffer: Promise<T>[] = promiseArray.splice(0, bufferSize);
    let allPromises: T[] = [];

    while (promiseArray.length > 0 || buffer.length > 0) {
        const singlePromise: T = await Promise.race(buffer);

        for (const index in buffer) {
            if (singlePromise.guid === (await buffer[index]).guid) {
                buffer.splice(parseInt(index), 1);

                if (buffer.length < bufferSize) {
                    break;
                }
            }
        }

        if (promiseArray.length > 0) {
            buffer.push(promiseArray.shift()!);
        }

        allPromises.push(singlePromise);
    }
    return allPromises;
}