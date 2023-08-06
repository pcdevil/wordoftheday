import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';
import RssParser from 'rss-parser';

import WordResolver, { NoItemsError, RssParserError } from '../src/word-resolver.mjs';

function fakeItem () {
	const link = 'https://www.merriam-webster.com/word-of-the-day/bully pulpit-2023-07-29';
	const title = 'bully pulpit';
	const pubDate = 'Sat, 29 Jul 2023 01:00:01 -0400';

	return {
		link,
		isoDate: new Date(pubDate).toISOString(),
		pubDate,
		title,
	};
}

describe('WordResolver', () => {
	const url = 'https://example.com/rss2';
	let rssParserMock;
	let wordResolver;

	beforeEach(() => {
		rssParserMock = new RssParser();
		mock.method(rssParserMock, 'parseURL').mock
			.mockImplementation(() => Promise.resolve({ items: [fakeItem()] }));

		wordResolver = new WordResolver(url, rssParserMock);
	});

	describe('get()', () => {
		it('should call the parse url method of rss parser with the given url', async () => {
			await wordResolver.get();

			strict.equal(rssParserMock.parseURL.mock.calls.length, 1);

			const firstCall = rssParserMock.parseURL.mock.calls[0];
			strict.deepEqual(firstCall.arguments, [url]);
		});

		it('should throw a RssParserError when the rss parser throws an error', async () => {
			rssParserMock.parseURL.mock.mockImplementation(() => Promise.reject(new Error()));

			await strict.rejects(async () => await wordResolver.get(), RssParserError);
		});

		it('should throw a NoItemsError when there is no item in the feed', async () => {
			rssParserMock.parseURL.mock.mockImplementation(() => Promise.resolve({ items: [] }));

			await strict.rejects(async () => await wordResolver.get(), NoItemsError);
		});

		it('should properly return a word object', async () => {
			const { pubDate, link, title } = fakeItem();

			const wordObject = await wordResolver.get();

			strict.deepEqual(wordObject, {
				date: new Date(pubDate),
				url: encodeURI(link),
				word: title,
			});
		});
	});
});
