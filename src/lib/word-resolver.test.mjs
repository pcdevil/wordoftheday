import { parseFeed } from 'htmlparser2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { config } from '#lib/config.mjs';
import { mockLoggerFactory } from '#test/mock-logger-factory.mjs';
import { request } from '#util/request.mjs';
import { FeedParserError, NoItemError, WordResolver } from './word-resolver.mjs';

vi.mock('htmlparser2');
vi.mock('#lib/config.mjs');
vi.mock('#util/request.mjs');
const mocks = {
	config: vi.mocked(config),
	parseFeed: vi.mocked(parseFeed),
	request: vi.mocked(request),
};

function fakeItem(suffix = '') {
	const link = `https://www.merriam-webster.com/word-of-the-day/bully+pulpit-2023-07-29_${suffix}`;
	const title = `bully pulpit${suffix}`;
	const pubDate = new Date('Sat, 29 Jul 2023 01:00:01 -0400');

	return {
		link,
		pubDate,
		title,
	};
}

describe('WordResolver', () => {
	const feedTextMock = '<rss><channel></channel></rss>';
	let itemsMock;
	let textMock;
	let wordResolver;

	beforeEach(() => {
		vi.spyOn(mocks.config, 'source', 'get').mockReturnValue({
			url: 'https://example.com/rss2',
			itemIndex: 1,
		});

		textMock = vi.fn().mockResolvedValue(feedTextMock);
		mocks.request.mockResolvedValue({
			ok: true,
			text: textMock,
		});

		itemsMock = Array.from({ length: 3 }, (_value, index) => fakeItem(index));
		mocks.parseFeed.mockReturnValue({ items: itemsMock });

		wordResolver = new WordResolver(mockLoggerFactory());
	});

	describe('get()', () => {
		it('should return the word object', async () => {
			const targetItemMock = itemsMock[mocks.config.source.itemIndex];

			const wordObject = await wordResolver.get();

			expect(mocks.request).toHaveBeenCalledWith(mocks.config.source.url, {}, expect.any(Object));
			expect(mocks.parseFeed).toBeCalledWith(feedTextMock);
			expect(wordObject).toEqual({
				date: targetItemMock.pubDate,
				url: encodeURI(targetItemMock.link),
				word: targetItemMock.title,
			});
		});

		it('should return the word object when the source.itemIndex config is negative', async () => {
			mocks.config.source.itemIndex = -1;
			const targetItemMock = itemsMock[2];

			const wordObject = await wordResolver.get();

			expect(wordObject).toEqual({
				date: targetItemMock.pubDate,
				url: encodeURI(targetItemMock.link),
				word: targetItemMock.title,
			});
		});

		it('should throw a FeedParserError when the feed parser throws an error', async () => {
			mocks.parseFeed.mockImplementation(() => {
				throw new Error();
			});

			await expect(wordResolver.get()).rejects.toThrowError(FeedParserError);
		});

		it('should throw a NoItemError when the requested item index is not available', async () => {
			mocks.config.source.itemIndex = itemsMock.length;

			await expect(wordResolver.get()).rejects.toThrowError(NoItemError);
		});
	});
});
