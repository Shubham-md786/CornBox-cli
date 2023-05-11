import axios from 'axios';
import * as cheerio from 'cheerio';
import bytes from 'bytes';
import Anime from './Anime.js';
import { base64Encode } from '../../utils/base64Encode.js';
import { download } from '../../utils/download.js';

const baseInfoURL = 'https://api.animixplay.tube/ajax/search?page=1&search=';
const baseEpURL = 'https://api.animixplay.tube/ajax/list?series=';
let autoDownloadURL = 'https://cornbox.netlify.app/auto-download?';

class Download extends Anime {
    constructor(animeName) {
        super(animeName);
        this.infoURL = `${baseInfoURL}${base64Encode(
            `?keyword=${this.slug}`
        )}%3D`;
    }

    async setInfo() {
        try {
            const { data } = await axios.get(this.infoURL, {
                headers: { 'Accept-Encoding': 'gzip' },
            });
            const $ = cheerio.load(data.data);
            this.animeInfo = $('li')
                .map((i, elem) => {
                    const title = $(elem).find('.name').text();
                    const slug = $(elem).find('a').attr('href');
                    return { title, slug };
                })
                .get();
        } catch (error) {
            throw error;
        }
    }

    async getTitles() {
        try {
            await this.setInfo();
            return this.animeInfo.map(({ title }) => title);
        } catch (error) {
            throw error;
        }
    }

    async getId(selectedAnime) {
        try {
            const { data } = await axios.get(selectedAnime.slug, {
                headers: { 'Accept-Encoding': 'gzip' },
            });
            const $ = cheerio.load(data);
            return $('#player-id').attr('value');
        } catch (error) {
            throw error;
        }
    }

    async getTotalEpisodes(selectedAnime) {
        try {
            const id = await this.getId(selectedAnime);
            const { data } = await axios.get(`${baseEpURL}${id}`, {
                headers: { 'Accept-Encoding': 'gzip' },
            });
            const $ = cheerio.load(data.eplist);
            return (
                $('#w-episodes .dropdown-item:last-child')
                    .text()
                    .trim()
                    .split('-')[1] * 1
            );
        } catch (error) {
            throw error;
        }
    }

    async select(title) {
        try {
            const selectedAnime = this.animeInfo.find(
                (ele) => ele.title === title
            );
            selectedAnime.download = selectedAnime.slug.replace(
                '/anime/',
                '/download/'
            );
            selectedAnime.totalEpisodes = await this.getTotalEpisodes(
                selectedAnime
            );
            this.selectedAnime = selectedAnime;
            return this.selectedAnime;
        } catch (error) {
            throw error;
        }
    }

    async fetchDownloadData(epNo) {
        try {
            const url = `${this.selectedAnime.download}-episode-${epNo}`;
            const { data } = await axios.get(url, {
                headers: { 'Accept-Encoding': 'gzip' },
            });
            const $ = cheerio.load(data);
            const downloadData = $('.dl-site')
                .map(async (index, element) => {
                    const quality = $(element)
                        .find('.site-name')
                        .text()
                        .trim()
                        .split('x')[1];
                    const url = $(element).find('.dls-download a').attr('href');
                    const title = `${$('#seriestitle')
                        .text()
                        .split('-')[1]
                        .trim()} ${quality}p`;
                    // Try catch
                    const urlHead = await axios.head(url);
                    const size = bytes(
                        parseInt(urlHead.headers['content-length'], 10),
                        {
                            unitSeparator: ' ',
                        }
                    );
                    return { quality, size, url, title, epNo };
                })
                .get();
            return Promise.all(downloadData);
        } catch (error) {
            throw error;
        }
    }

    async fetchDownload(epNo) {
        try {
            const downloads = await this.fetchDownloadData(epNo);
            this.selectedAnime.downloadData = downloads;
            return downloads;
        } catch (error) {
            throw error;
        }
    }

    async fetchDownloads(from, to) {
        try {
            const promises = [];
            for (from; from <= to; from++) {
                promises.push(this.fetchDownloadData(from));
            }
            const downloads = await Promise.all(promises);
            this.selectedAnime.downloadData = downloads;
            return downloads;
        } catch (error) {
            throw error;
        }
    }

    async downloadOne(quality, options) {
        quality = quality.split('  ')[0];
        const selectedDownload = this.selectedAnime.downloadData.find(
            (ele) => `${ele.quality}p` === quality
        );
        this.selectedAnime.selectedDownload = selectedDownload;
        if (options.json) {
            console.log(selectedDownload);
            return;
        } else if (options.url) {
            autoDownloadURL += `urls=${selectedDownload.url}`;
            console.log(autoDownloadURL);
            return;
        } else {
            await download('Anime', [selectedDownload], options);
        }
    }

    async downloadMany(quality, options) {
        quality = quality.split('  ')[0];
        const selectedDownloads = this.selectedAnime.downloadData.flatMap(
            (innerArr) =>
                innerArr.filter((obj) => `${obj.quality}p` === quality)
        );
        this.selectedAnime.selectedDownloads = selectedDownloads;
        if (options.json) {
            console.log(selectedDownloads);
            return;
        } else if (options.url) {
            selectedDownloads.forEach(
                (ele) => (autoDownloadURL += `urls=${ele.url}&`)
            );
            console.log(autoDownloadURL);
            return;
        } else {
            await download('Anime', selectedDownloads, options);
        }
    }
}

export default Download;
