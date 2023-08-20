import process from 'node:process';

import WordOfTheDay from '#src/word-of-the-day.mjs';

const argumentList = process.argv.slice(2);
const sourceName = argumentList[0];

const wordOfTheDay = new WordOfTheDay();
await wordOfTheDay.run(sourceName);
