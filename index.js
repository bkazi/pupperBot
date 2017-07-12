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
url.searchParams.append(GIPHY_API_PARAM, GIPHY_API_KEY);
url.searchParams.append(GIPHY_SEARCH_PARAM, 'cats');
url.searchParams.append(GIPHY_LIMIT_PARAM, '2');

request(url.toString())
    .then((response) => {
        return JSON.parse(response);
    })
    .then((json) => {
        const data = json.data;
    });
