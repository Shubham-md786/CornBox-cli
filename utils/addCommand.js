import { Command } from 'commander';

const downloadCommand = () => {
    const downloadCommand = new Command('download');
    downloadCommand
        .option('-j,--json', 'Get Download Info In JSON Format')
        .option('-u,--url', 'Get A Url To Download')
        .option('-q,--quiet', 'Suppress Output During Download')
        .option('-o,--output [file]', 'Specify The Output File Name'); //.option('-r,--retry [num]','Specify The Number Of Retries In Case Of A failed Download',parseInt)
    /*downloadCommand.addOption(
        new Option(
            '-f,--force',
            'Force The Download Even If The File Already Exists'
        )
    );*/
    return downloadCommand;
};

export { downloadCommand };
