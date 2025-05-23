import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { MastodonPoster } from '#src/lib/mastodon-poster.mjs';
import { WordResolver } from '#src/lib/word-resolver.mjs';
import { fakeWordObject } from '#src/vitest/fakers/word-object.faker.mjs';
import { WordOfTheDay } from './word-of-the-day.mjs';

vi.mock('#src/lib/mastodon-poster.mjs');
vi.mock('#src/lib/word-resolver.mjs');
const mocks = {
	MastodonPoster: vi.mocked(MastodonPoster),
	WordResolver: vi.mocked(WordResolver),
};

describe('WordOfTheDay', () => {
	let testWordObject;
	let wordOfTheDay;

	beforeEach(() => {
		testWordObject = fakeWordObject();
		mocks.WordResolver.prototype.get.mockResolvedValue(testWordObject);

		wordOfTheDay = new WordOfTheDay();
	});

	describe('run()', () => {
		it('should post the word retrieved to the configured mastodon', async () => {
			await wordOfTheDay.run();

			const [wordResolverMock] = mocks.WordResolver.mock.instances;
			expect(wordResolverMock.get).toHaveBeenCalled();
			const [mastodonPosterMock] = mocks.MastodonPoster.mock.instances;
			expect(mastodonPosterMock.post).toHaveBeenCalledWith(testWordObject);
		});
	});
});
