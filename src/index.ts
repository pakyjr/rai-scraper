import { RaiScraperV1 } from './raiV2';
import { RaiScraperV2 } from './raiV1';
import { config } from "./const";
import { RaiScraperV3 } from './raiV3';

const s1 = new RaiScraperV1();
const s2 = new RaiScraperV2();
const s3 = new RaiScraperV3();

s2.startScraping(config.daysToScrape, config.channelsToScrape) //concurrency for each channel
s1.startScraping(config.daysToScrape, config.channelsToScrape); //cocnurrency for each date, should be faster than v1
s3.startScraping(config.daysToScrape, config.channelsToScrape) //V2 But using generator