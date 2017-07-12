const {URL} = require('url');
const request = require('request-promise-native');

const GIPHY_BASE_URL = 'https://api.giphy.com';
const GIPHY_SEARCH_PATH = 'v1/gifs/search';
const GIPHY_API_PARAM = 'key';
const GIPHY_API_KEY = process.env.API_KEY;
const GIPHY_SEARCH_PARAM = 'q';
const GIPHY_LIMIT_PARAM = 'limit';

const url = new URL(GIPHY_BASE_URL);
url.pathname = GIPHY_SEARCH_PATH;

const options = {
    uri: url.toString(),
    qs: {},
    json: true,
};

options.qs[GIPHY_API_PARAM] = GIPHY_API_KEY;
options.qs[GIPHY_SEARCH_PARAM] = 'cats';
options.qs[GIPHY_LIMIT_PARAM] = 1;

request(options)
    .then((json) => {
        const data = json.data;
    })
    .catch(console.error);
