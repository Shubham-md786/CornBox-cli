import { Command } from 'commander';
import { download } from '../commands/anime/download.js';
import { downloadCommand } from '../utils/addCommand.js';

const makeAnimeCommand = () => {
    const anime = new Command('anime');

    anime.showHelpAfterError(
        '(add --help for additional information)'.brightWhite
    );

    anime.addCommand(
        downloadCommand()
            .summary('Download Anime')
            .description('Download Anime Or Anime Movies Of Your Choice')
            .action(download)
    );
    return anime;
};

export default makeAnimeCommand;
