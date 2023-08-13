import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';
import RssParser from 'rss-parser';

import WordResolver, { NoItemError, RssParserError } from '../../src/lib/word-resolver.mjs';

function fakeItem (titleSuffix = '') {
	const link = 'https://www.merriam-webster.com/word-of-the-day/bully pulpit-2023-07-29';
	const title = `bully pulpit${titleSuffix}`;
	const pubDate = 'Sat, 29 Jul 2023 01:00:01 -0400';

	return {
		link,
		isoDate: new Date(pubDate).toISOString(),
		pubDate,
		title,
	};
}

describe('WordResolver', () => {
	const feedUrl = 'https://example.com/rss2';
	let rssParserMock;
	let wordResolver;

	beforeEach(() => {
		rssParserMock = new RssParser();
		mock.method(rssParserMock, 'parseURL').mock
			.mockImplementation(() => Promise.resolve({ items: [fakeItem()] }));

		wordResolver = new WordResolver(rssParserMock);
	});

	describe('get()', () => {
		it('should call the parse url method of rss parser with the given url', async () => {
			await wordResolver.get(feedUrl, 0);

			strict.equal(rssParserMock.parseURL.mock.calls.length, 1);

			const firstCall = rssParserMock.parseURL.mock.calls[0];
			strict.deepEqual(firstCall.arguments, [feedUrl]);
		});

		it('should throw a RssParserError when the rss parser throws an error', async () => {
			rssParserMock.parseURL.mock.mockImplementation(() => Promise.reject(new Error()));

			await strict.rejects(async () => await wordResolver.get(feedUrl, 0), RssParserError);
		});

		it('should throw a NoItemError when the requested item index is not available', async () => {
			const itemCount = 3;
			rssParserMock.parseURL.mock.mockImplementation(() => Promise.resolve({
				items: Array.from({ length: itemCount }, () => fakeItem()),
			}));

			// retrieve the item after the last one
			const itemIndex = itemCount + 1;
			await strict.rejects(async () => await wordResolver.get(feedUrl, itemIndex), NoItemError);
		});

		it('should properly return a word object with the given item index', async () => {
			const itemCount = 3;
			rssParserMock.parseURL.mock.mockImplementation(() => Promise.resolve({
				items: Array.from({ length: itemCount }, (_value, index) => fakeItem(index + 1)),
			}));

			// create a fake third item for assertion
			const { pubDate, link, title } = fakeItem(itemCount);

			// retrieve the third item by relative index
			const itemIndex = -1;
			const wordObject = await wordResolver.get(feedUrl, itemIndex);

			strict.deepEqual(wordObject, {
				date: new Date(pubDate),
				url: encodeURI(link),
				word: title,
			});
		});
	});
});
