
export interface Scraper {
    fetchChannelData(scrapingDates: string[], channelsToScrape: ChannelInfo[], templateChannelProgram: string): Promise<ChannelPlan[]>;
}

export interface ChannelInfo {
    id: string,
    name: string,
    code: string
}

export interface ProgramInfo {
    id: string
    name: string
    date: string
    hour: string
    duration: string
}

export interface Plan {
    date: string,
    events: ProgramInfo[]
}

export interface ChannelPlan {
    channel: ChannelInfo,
    plan: Plan[]
}

export interface ParsedChannelPlan {
    channel: string,
    date: string,
    hour: string,
    event: string
}

export interface Config {
    daysToScrape: number,
    channelsToScrape: number,
    bufferSize: number
}

export interface GenericItem {
    guid: string
}

export interface PromiseGeneratorsFn {
    (arg1: string[], arg2: ChannelInfo, arg3: string): Promise<ChannelPlan>
}


