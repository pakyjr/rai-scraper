"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const raiV2_1 = require("./raiV2");
const raiV1_1 = require("./raiV1");
const const_1 = require("./const");
const raiV3_1 = require("./raiV3");
const s1 = new raiV2_1.RaiScraperV1();
const s2 = new raiV1_1.RaiScraperV2();
const s3 = new raiV3_1.RaiScraperV3();
s2.startScraping(const_1.config.daysToScrape, const_1.config.channelsToScrape); //concurrency for each channel
s1.startScraping(const_1.config.daysToScrape, const_1.config.channelsToScrape); //cocnurrency for each date, should be faster than v1
s3.startScraping(const_1.config.daysToScrape, const_1.config.channelsToScrape); //V2 But using generator
//# sourceMappingURL=index.js.map