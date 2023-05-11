#! /usr/bin/env node

import { Command } from 'commander';
import colors from 'colors';
import makeAnimeCommand from './anime.js';

const program = new Command();

program
    .version('v1.0.5', '--version', 'Output the current version')
    .name('cornbox')
    .description('A CLI For Anime,Movies,Series');

program.addCommand(makeAnimeCommand());

program.parse(process.argv);
