import { all } from "axios";
import { GenericItem } from "./types";
import { genericPromiseBuffer } from "./utils";

export async function testPromiseRace() {
    const promiseGeneratorArray: (() => Promise<GenericItem>)[] = [];
    const promiseAmount = 5;
    const promiseAtTime = 2;
    const timeOutArray: number[] = [2000, 1000, 3500, 1500, 3500];
    const start = Date.now();



    // for (let index = 0; index < promiseAmount; index++) {
    //     promiseGeneratorArray.push(() => examplePromise(index, timeOutArray[index]));
    // }

    console.log(`Start Time ${start}`);
    // const allResults = genericFunctionsPromiseBufferV3(promiseAtTime, timeOutArray);
    let allPromises: any = [];
    for await (const res of genericFunctionsPromiseBufferV3(promiseAtTime, timeOutArray)) {
        if (!Array.isArray(res)) {
            allPromises.push(res);
        } else {
            allPromises.push(...res);
        }
    }

    console.log(allPromises);

    const end = Date.now();
    console.log(`End Time - ${end}`)
    console.log(`Elapsed Time - ${end - start}`)
    // console.log(allResults);
    console.log(`Fine`);
}



async function genericFunctionsPromiseBuffer<T extends GenericItem>(promiseGeneratorArray: (() => Promise<GenericItem>)[], promiseAtTime: number): Promise<GenericItem[]> {
    // let buffer: Promise<T>[] = [];
    let buffer: Promise<GenericItem>[] = [];
    let allPromises: Promise<GenericItem>[] = [];
    let promiseAmount: number = promiseGeneratorArray.length;
    let runningPromises: number = 0;

    for (let i = 0; i < promiseAmount; i++) {
        if (runningPromises < 5) {
            buffer.push(promiseGeneratorArray[i]());
            runningPromises += 1;
        }
        if (runningPromises >= promiseAtTime) {
            const winnerPromise = await Promise.race(buffer);
            const index = buffer.findIndex(async element => (await element).guid === winnerPromise.guid);
            allPromises.push(...buffer.splice(index, 1));
            runningPromises -= 1;
        }
    }
    allPromises.push(...buffer);
    let res = await Promise.all(allPromises);
    return res;
}

async function genericFunctionsPromiseBufferV2<T extends GenericItem>(promiseGeneratorArray: (() => Promise<GenericItem>)[], bufferSize: number): Promise<GenericItem[]> {
    const buffer: Promise<GenericItem>[] = [];
    let allPromises: Promise<GenericItem>[] = [];
    let promiseAmount: number = promiseGeneratorArray.length;

    for (let i = 0; i < promiseAmount; i++) {
        let currentPromise = promiseGeneratorArray[i]();
        currentPromise.finally(() => {
            buffer.splice(buffer.indexOf(currentPromise), 1)
        })
        buffer.push(currentPromise);
        allPromises.push(currentPromise);
        if (buffer.length >= bufferSize) {
            await Promise.race(buffer);
        }
    }
    let res = await Promise.all(allPromises);
    return res;
}

async function* genericFunctionsPromiseBufferV3<T extends GenericItem>(concurrency: number, timeOutArray: number[]): any {
    let promiseArray: any = [];

    for (let i = 0; i < timeOutArray.length; i++) {
        let currentPromise = examplePromise(i, timeOutArray[i]);
        currentPromise.finally(() => {
            promiseArray.splice(promiseArray.indexOf(currentPromise), 1);
        })

        promiseArray.push(currentPromise)

        if (promiseArray.length >= concurrency) {
            yield Promise.race(promiseArray);
        }
    }

    yield Promise.all(promiseArray);
}
async function examplePromise(val: number, timeout: number): Promise<GenericItem> {
    console.log(`Start - ${val + 1}`);
    await new Promise(resolve => setTimeout(resolve, timeout));
    console.log(`End - ${val + 1}`);
    return {
        guid: val.toString()
    }
}
