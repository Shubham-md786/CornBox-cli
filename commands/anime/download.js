import inquirer from 'inquirer';
import { isRequired } from '../../utils/validation.js';
import Download from '../../lib/anime/Download.js';
import { qualityPrompt } from '../../utils/quality.js';

const serverError = () => {
    console.error('> Server Down 💥'.red);
    console.warn('> Please Try Again Later 🔄'.brightWhite);
};

const download = async (options) => {
    const { animeName } = await inquirer.prompt([
        {
            type: 'input',
            name: 'animeName',
            message: `Enter Anime Name : `,
            validate: isRequired,
        },
    ]);

    const data = new Download(animeName);
    const titles = await data.getTitles();

    if (titles.length === 0) {
        console.error(`> No Anime Found With Name ${animeName} 🤔`.red);
        console.warn('> Please Try Again 🔄'.brightWhite);
        return;
    }

    const { selectedAnime } = await inquirer.prompt([
        {
            type: 'rawlist',
            name: 'selectedAnime',
            message: 'Select Your Anime : ',
            choices: titles,
        },
    ]);

    let anime;
    try {
        anime = await data.select(selectedAnime);
    } catch (error) {
        serverError();
        return;
    }
    if (anime.totalEpisodes === 1) {
        let downloadData;
        try {
            downloadData = await data.fetchDownload(1);
        } catch (error) {
            serverError();
            return;
        }
        const { quality } = await qualityPrompt(downloadData);
        await data.downloadOne(quality, options);
    } else {
        console.log(`> Total ${anime.totalEpisodes} Episodes Founded 🔎`.green);

        const { downloadType } = await inquirer.prompt([
            {
                type: 'list',
                name: 'downloadType',
                message: 'Select Download Type : ',
                choices: ['single', 'multiple'],
            },
        ]);

        const episodePrompt = {
            type: 'number',
            validate: (value) => {
                const valid =
                    !isNaN(parseFloat(value)) &&
                    value > 0 &&
                    value <= anime.totalEpisodes;
                return (
                    valid ||
                    `> Please enter a valid episode number between 1 and ${anime.totalEpisodes}`
                        .red
                );
            },
        };

        if (downloadType === 'single') {
            const { epNo } = await inquirer.prompt([
                { ...episodePrompt, name: 'epNo', message: 'Episode No : ' },
            ]);
            let downloadData;
            try {
                downloadData = await data.fetchDownload(epNo);
            } catch (error) {
                serverError();
                return;
            }
            const { quality } = await qualityPrompt(downloadData);
            await data.downloadOne(quality, options);
        } else {
            const { from } = await inquirer.prompt([
                { ...episodePrompt, name: 'from', message: 'From Episode : ' },
            ]);
            const { to } = await inquirer.prompt([
                {
                    ...episodePrompt,
                    name: 'to',
                    message: 'To Episode : ',
                    validate: (value) => {
                        const valid =
                            !isNaN(parseFloat(value)) &&
                            value > 0 &&
                            value <= anime.totalEpisodes &&
                            value != from &&
                            value >= from;
                        return valid || `> Please enter a valid episode ❌`.red;
                    },
                },
            ]);
            console.warn('> Please Wait. It Will Take Some Time 🕐'.yellow);
            let downloadData;
            try {
                downloadData = await data.fetchDownloads(from, to);
            } catch (error) {
                serverError();
                return;
            }
            const { quality } = await qualityPrompt(downloadData[0]);
            await data.downloadMany(quality, options);
        }
    }
};

export { download };
