import { parseFeed } from 'htmlparser2';

import { FetchError, assertResponseOk } from '#util';

export class FeedParserError extends Error {}
export class NoItemError extends Error {}

export class WordResolver {
	#fetchMethod;
	#logger;
	#parseFeedMethod;

	constructor (logger, fetchMethod = globalThis.fetch, parseFeedMethod = parseFeed) {
		this.#logger = logger.child({ name: this.constructor.name });
		this.#fetchMethod = fetchMethod;
		this.#parseFeedMethod = parseFeedMethod;
	}

	async get (feedUrl, itemIndex) {
		let text;
		let items;

		try {
			const response = await this.#fetchWithMeasure(feedUrl);

			assertResponseOk(response);

			text = await response.text();
		} catch (error) {
			if (error instanceof FetchError) {
				throw error;
			}
			throw new FetchError('Feed get failed.', { cause: error });
		}

		try {
			const feed = this.#parseFeedWithMeasure(text);
			items = feed.items;
		} catch (error) {
			throw new FeedParserError('Rss parser call failed.', { cause: error });
		}

		const item = items.at(itemIndex);

		if (!item) {
			throw new NoItemError(`No item found in the rss feed with ${itemIndex} index.`);
		}

		const date = item.pubDate;
		const word = item.title;
		const url = encodeURI(item.link);

		return {
			date,
			word,
			url,
		};
	}

	async #fetchWithMeasure (feedUrl) {
		const measureName = 'send request';
		try {
			this.#logger.mark(`${measureName} start`);
			return await this.#fetchMethod(feedUrl);
		} finally {
			this.#logger.mark(`${measureName} end`);
			this.#logger.measure(measureName, `${measureName} start`, `${measureName} end`);
		}
	}

	#parseFeedWithMeasure (text) {
		const measureName = 'parse feed';
		try {
			this.#logger.mark(`${measureName} start`);
			return this.#parseFeedMethod(text);
		} finally {
			this.#logger.mark(`${measureName} end`);
			this.#logger.measure(measureName, `${measureName} start`, `${measureName} end`);
		}
	}
}
