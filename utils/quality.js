import inquirer from 'inquirer';

const qualityPrompt = (q) => {
    const quality = q.map(
        (ele) => `${ele.quality}p  [~${ele.size || 'Not Available'}]`
    );
    return inquirer.prompt([
        {
            type: 'rawlist',
            name: 'quality',
            message: 'Select Quality : ',
            choices: quality,
        },
    ]);
};

export { qualityPrompt };
