const {promisify} = require('util');
const {URL} = require('url');
const fs = require('fs');
const readFile = promisify(fs.readFile);
const stat = promisify(fs.stat);
const request = require('request-promise-native');
const Twitter = require('twitter');

const client = new Twitter({
    consumer_key: process.env.CONSUMER_KEY,
    consumer_secret: process.env.CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
});

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

function isHttpPath(pathString) {
    return /^https?:\/\//.test(pathString);
}

async function downloadMedia(path) {
    const imgData = {
        size: undefined,
        image: undefined,
        type: undefined,
    };
    try {
        const data = await request.get(path, {encoding: null})
            .on('response', (response) => {
                imgData.size = response.headers['content-length'];
                imgData.type = response.headers['content-type'];
            });
        imgData.image = data;
    } catch (e) {
        throw e;
    }
    return imgData;
}

async function uploadImage(client, path) {
    try {
        let data;
        if (isHttpPath(path)) {
            data = (await downloadMedia(path)).image;
        } else {
            data = await readFile(path);
        }
        const media = await client.post('media/upload', {media: data});
        return media.media_id_string;
    } catch (e) {
        throw e;
    }
}

async function uploadGIF(client, path) {
    try {
        let size;
        let data;
        let type;
        if (isHttpPath(path)) {
            const imgData = await downloadMedia(path);
            data = imgData.image;
            size = imgData.size;
            type = imgData.type;
        } else {
            data = await readFile(path);
            size = (await stat(path)).size;
            type = 'image/gif'; // lol this totally assumes it just a GIF
        }

        const mediaId = (await client.post('media/upload', {
            command: 'INIT',
            total_bytes: size,
            media_type: type,
        })).media_id_string;

        await client.post('media/upload', {
            command: 'APPEND',
            media_id: mediaId,
            media: data,
            segment_index: 0,
        });

        await client.post('media/upload', {
            command: 'FINALIZE',
            media_id: mediaId,
        });

        return mediaId;
    } catch (e) {
        throw e;
    }
    return;
}

(async function(client) {
    try {
        const gifData = await getGIFS('cats', 2);
        const imgUrls = gifData.map((data) => data.images.fixed_height.url);
        for (let url of imgUrls) {
            const mediaId = await uploadGIF(client, url);
            await client.post('statuses/update', {media_ids: mediaId});
        }
    } catch (e) {
        console.error(e);
    }
})(client);
