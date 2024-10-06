import 'dotenv/config';
// project imports
import { WordOfTheDay } from '#src/word-of-the-day.mjs';

const wordOfTheDay = new WordOfTheDay();
await wordOfTheDay.run();
