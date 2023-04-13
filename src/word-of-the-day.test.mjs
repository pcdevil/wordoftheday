import { strict } from 'node:assert';
import {
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

import { MastodonPoster, WordResolver } from '#lib';
import { InvalidSourceNameError, WordOfTheDay } from '#src/word-of-the-day.mjs';
import { mockLoggerFactory } from '#util/logger-factory.test.mjs';

describe('WordOfTheDay', () => {
	const sourceName = 'theFreeDictionary';
	const wordObject = {
		date: new Date('2023-08-16T05:00:00.000Z'),
		url: 'https://www.thefreedictionary.com/punctilious',
		word: 'punctilious',
	};
	let configMock;
	let mastodonPosterMock;
	let wordResolverMock;
	let wordOfTheDay;

	beforeEach(() => {
		configMock = {
			mastodon: {
				accessToken: 'eSbzh2R7x5JTNqpOe9oZSFf-Uf7jJyXIqHquSSACeYo',
				baseUrl: 'https://mastodon.social',
			},
			sources: {
				[sourceName]: {
					hashtag: '#TheFreeDictionary',
					itemIndex: 0,
					url: 'https://www.thefreedictionary.com/_/WoD/rss.aspx',
				},
			},
		};

		const loggerMock = mockLoggerFactory();

		mastodonPosterMock = new MastodonPoster(loggerMock);
		mock.method(mastodonPosterMock, 'post').mock
			.mockImplementation(() => Promise.resolve());
		wordResolverMock = new WordResolver(loggerMock);
		mock.method(wordResolverMock, 'get').mock
			.mockImplementation(() => Promise.resolve(wordObject));

		wordOfTheDay = new WordOfTheDay(configMock, loggerMock, mastodonPosterMock, wordResolverMock);
	});

	describe('run()', () => {
		it('should get the word from the configured feed', async () => {
			await wordOfTheDay.run(sourceName);

			strict.equal(wordResolverMock.get.mock.calls.length, 1);

			const firstCall = wordResolverMock.get.mock.calls[0];
			strict.deepEqual(firstCall.arguments, [
				configMock.sources[sourceName].url,
				configMock.sources[sourceName].itemIndex,
			]);
		});

		it('should post the fetched word to the configured mastodon', async () => {
			await wordOfTheDay.run(sourceName);

			strict.equal(mastodonPosterMock.post.mock.calls.length, 1);

			const firstCall = mastodonPosterMock.post.mock.calls[0];
			strict.deepEqual(firstCall.arguments, [
				configMock.mastodon.baseUrl,
				configMock.mastodon.accessToken,
				wordObject,
				configMock.sources[sourceName].hashtag,
			]);
		});

		it('should throw an InvalidSourceNameError when the given source name is invalid', async () => {
			await strict.rejects(
				async () => await wordOfTheDay.run(sourceName + 'NotExisting'),
				InvalidSourceNameError
			);
		});
	});
});
