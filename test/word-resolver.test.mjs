import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';
import RssParser from 'rss-parser';

import WordResolver from '../src/word-resolver.mjs';

describe('WordResolver', () => {
	const url = 'https://example.com/rss2';
	let rssParserMock;
	let wordResolver;

	beforeEach(() => {
		rssParserMock = new RssParser();
		mock.method(rssParserMock, 'parseURL').mock
			.mockImplementation(() => Promise.resolve({ items: [] }));

		wordResolver = new WordResolver(url, rssParserMock);
	});

	describe('get()', () => {
		it('should call the parse url method of rss parser with the given url', async () => {
			await wordResolver.get();

			strict.equal(rssParserMock.parseURL.mock.calls.length, 1);

			const firstCall = rssParserMock.parseURL.mock.calls[0];
			strict.deepEqual(firstCall.arguments, [url]);
		});

		it('should return undefined when there is no item', async () => {
			const wordObject = await wordResolver.get();

			strict.equal(wordObject, undefined);
		});

		it('should properly return a word object', async () => {
			const link = 'https://www.merriam-webster.com/word-of-the-day/bully pulpit-2023-07-29';
			const title = 'bully pulpit';
			const pubDate = 'Sat, 29 Jul 2023 01:00:01 -0400';

			rssParserMock.parseURL.mock.mockImplementation(() => Promise.resolve({
				items: [
					{
						link,
						isoDate: new Date(pubDate).toISOString(),
						pubDate,
						title,
					},
				],
			}));

			const wordObject = await wordResolver.get();

			strict.deepEqual(wordObject, {
				date: new Date(pubDate),
				url: encodeURI(link),
				word: title,
			});
		});
	});
});
