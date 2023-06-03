import axios from 'axios';

export class networkHandler {
    constructor() { }
    async get(url: string) {
        const { data } = await axios({
            method: "GET",
            url,
        })
        return data;
    }
}