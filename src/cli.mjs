import dotenv from 'dotenv';
// project imports
import { WordOfTheDay } from '#src/word-of-the-day.mjs';

dotenv.config({
	processEnv: process.env,
	quiet: true,
});

const wordOfTheDay = new WordOfTheDay();
await wordOfTheDay.run();
