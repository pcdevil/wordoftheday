import { parseFeed } from 'htmlparser2';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { config } from '#src/lib/config.mjs';
import { request } from '#src/util/request.mjs';
import { fakeSourceConfig } from '#src/vitest/fakers/config.faker.mjs';
import { fakeFeedItems } from '#src/vitest/fakers/feed-item.faker.mjs';
import { mockTextResponse } from '#src/vitest/mocks/response.mock.mjs';
import { FeedParserError, NoItemError, WordResolver } from './word-resolver.mjs';

vi.mock('htmlparser2');
vi.mock('#src/lib/config.mjs');
vi.mock('#src/util/request.mjs');
const mocks = {
	config: vi.mocked(config),
	parseFeed: vi.mocked(parseFeed),
	request: vi.mocked(request),
};

describe('WordResolver', () => {
	const testFeedText = '<rss><channel></channel></rss>';
	let testFeedItems;
	let wordResolver;

	beforeEach(() => {
		vi.spyOn(mocks.config, 'source', 'get').mockReturnValue(fakeSourceConfig());

		mocks.request.mockResolvedValue(mockTextResponse(testFeedText));

		testFeedItems = fakeFeedItems(mocks.config.source.itemIndex + 2);
		mocks.parseFeed.mockReturnValue({ items: testFeedItems });

		wordResolver = new WordResolver();
	});

	describe('get()', () => {
		it('should return the word object', async () => {
			const testFeedItem = testFeedItems[mocks.config.source.itemIndex];

			const wordObject = await wordResolver.get();

			expect(mocks.request).toHaveBeenCalledWith(mocks.config.source.url, {}, expect.any(Object));
			expect(mocks.parseFeed).toBeCalledWith(testFeedText);
			expect(wordObject).toEqual({
				date: testFeedItem.pubDate,
				url: encodeURI(testFeedItem.link),
				word: testFeedItem.title,
			});
		});

		it('should return the word object when the source.itemIndex config is negative', async () => {
			mocks.config.source.itemIndex = -1;
			const targetItemMock = testFeedItems.at(-1);

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
			mocks.config.source.itemIndex = testFeedItems.length;

			await expect(wordResolver.get()).rejects.toThrowError(NoItemError);
		});
	});
});
