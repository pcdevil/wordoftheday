import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

import { FeedParserError, NoItemError, WordResolver } from '#lib';
import { RequestError, ResponseError } from '#util';
import { mockLoggerFactory } from '#util/logger-factory.test.mjs';

function fakeItem(titleSuffix = '') {
	const link = 'https://www.merriam-webster.com/word-of-the-day/bully pulpit-2023-07-29';
	const title = `bully pulpit${titleSuffix}`;
	const pubDate = new Date('Sat, 29 Jul 2023 01:00:01 -0400');

	return {
		link,
		pubDate,
		title,
	};
}

describe('WordResolver', () => {
	const feedUrl = 'https://example.com/rss2';
	const feedText = '<rss><channel></channel></rss>';
	let textMock;
	let parseFeedMock;
	let requestWithMeasureMock;
	let wordResolver;

	beforeEach(() => {
		textMock = mock.fn(() => Promise.resolve(feedText));
		requestWithMeasureMock = mock.fn(() =>
			Promise.resolve({
				ok: true,
				text: textMock,
			})
		);
		parseFeedMock = mock.fn(() => ({ items: [fakeItem()] }));

		wordResolver = new WordResolver(mockLoggerFactory(), requestWithMeasureMock, parseFeedMock);
	});

	describe('get()', () => {
		it('should properly call the requestWithMeasure method', async () => {
			await wordResolver.get(feedUrl, 0);

			strict.equal(requestWithMeasureMock.mock.calls.length, 1);

			const [url, options] = requestWithMeasureMock.mock.calls[0].arguments;

			// check arguments one by one for better readability and debug
			strict.deepEqual(url, feedUrl);
			strict.deepEqual(options, {});
		});

		it('should parse the response feed', async () => {
			await wordResolver.get(feedUrl, 0);

			strict.equal(parseFeedMock.mock.calls.length, 1);

			const firstCall = parseFeedMock.mock.calls[0];
			strict.deepEqual(firstCall.arguments, [feedText]);
		});

		it('should properly return a word object with the given item index', async () => {
			const itemCount = 3;
			parseFeedMock.mock.mockImplementation(() => ({
				items: Array.from({ length: itemCount }, (_value, index) => fakeItem(index + 1)),
			}));

			// create a fake third item for assertion
			const { pubDate, link, title } = fakeItem(itemCount);

			// retrieve the third item by relative index
			const itemIndex = -1;
			const wordObject = await wordResolver.get(feedUrl, itemIndex);

			strict.deepEqual(wordObject, {
				date: pubDate,
				url: encodeURI(link),
				word: title,
			});
		});

		it('should throw a RequestError when the requestWithMeasure method throws an error', async () => {
			requestWithMeasureMock.mock.mockImplementation(() => Promise.reject(new Error()));

			await strict.rejects(
				async () => await wordResolver.get(feedUrl, 0),
				RequestError
			);
		});

		it('should throw a ResponseError when the response is not ok', async () => {
			const response = {
				ok: false,
				status: 404,
				statusText: 'Not Found',
			};
			requestWithMeasureMock.mock.mockImplementation(() => Promise.resolve(response));

			await strict.rejects(
				async () => await wordResolver.get(feedUrl, 0),
				new ResponseError(response.status, response.statusText)
			);
		});

		it('should throw a FeedParserError when the feed parser throws an error', async () => {
			const itemCount = 3;
			parseFeedMock.mock.mockImplementation(() => {
				throw new Error();
			});

			// retrieve the item after the last one
			const itemIndex = itemCount + 1;
			await strict.rejects(async () => await wordResolver.get(feedUrl, itemIndex), FeedParserError);
		});

		it('should throw a NoItemError when the requested item index is not available', async () => {
			const itemCount = 3;
			parseFeedMock.mock.mockImplementation(() => ({ items: [fakeItem()] }));

			// retrieve the item after the last one
			const itemIndex = itemCount + 1;
			await strict.rejects(async () => await wordResolver.get(feedUrl, itemIndex), NoItemError);
		});
	});
});
