const {URL} = require('url');
const request = require('request-promise-native');
const Twitter = require('Twitter');

const GIPHY_BASE_URL = 'https://api.giphy.com';
const GIPHY_SEARCH_PATH = 'v1/gifs/search';
const GIPHY_API_PARAM = 'key';
const GIPHY_API_KEY = process.env.GIPHY_API_KEY;
const GIPHY_SEARCH_PARAM = 'q';
const GIPHY_LIMIT_PARAM = 'limit';

async function getGIFS(searchQuery, limit=5) {
    const url = new URL(GIPHY_BASE_URL);
    url.pathname = GIPHY_SEARCH_PATH;

    const options = {
        uri: url.toString(),
        qs: {},
        json: true,
    };

    options.qs[GIPHY_API_PARAM] = GIPHY_API_KEY;
    options.qs[GIPHY_SEARCH_PARAM] = searchQuery.replace(/\s/, '+');
    options.qs[GIPHY_LIMIT_PARAM] = limit;

    let data;
    try {
        const json = await request(options);
        data = json.data;
    } catch (e) {
        console.error(e);
    }
    return data;
}
