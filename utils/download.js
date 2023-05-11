import Downloader from 'nodejs-file-downloader';
import inquirer from 'inquirer';
import ProgressBar from 'progress';
import bytes from 'bytes';
import { toFileName, getDirName } from './files.js';

const download = async (type, urls, options) => {
    const { force, quiet, output, retry } = options;
    const dir = getDirName(type);
    for (const url of urls) {
        try {
            let length = 0;
            let size;
            let bar;
            const downloader = new Downloader({
                url: url.url,
                directory: dir,
                //cloneFiles: force || false,
                maxAttempts: retry,
                fileName: `${toFileName(output || url.title)}.mp4`,
                onResponse: (res) => {
                    length = parseInt(res.headers['content-length'], 10);
                    size = bytes(length, { unitSeparator: ' ' });
                    if (!size) throw new Error('Not Available');
                    bar = new ProgressBar(
                        `> Ep ${url.epNo} [:bar] :rate/bps :percent :etas`,
                        {
                            complete: '=',
                            incomplete: ' ',
                            width: 20,
                            total: length,
                        }
                    );
                    if (!quiet) {
                        console.log(
                            `> Downloading "${url.title}" [${size}]`
                                .brightMagenta
                        );
                    }
                },
                onProgress: (percentage, chunk, remainingSize) => {
                    if (!quiet) {
                        bar.tick(chunk.length);
                    }
                },
            });
            await downloader.download();
            if (!quiet) {
                console.log(`"${url.title}" Downloaded ✅`.green);
            }
        } catch (err) {
            console.log(err);
            console.error(`> Not Able To Download "${url.title}"`.red);
            console.warn('> Please Try Again Later 🔄'.brightWhite);
        }
    }
};

export { download };
