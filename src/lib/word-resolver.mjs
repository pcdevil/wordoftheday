import { parseFeed } from 'htmlparser2';

import { FetchError, assertResponseOk } from '#util/fetch-response.mjs';

export class FeedParserError extends Error {}
export class NoItemError extends Error {}

export default class WordResolver {
	#fetchMethod;
	#parseFeedMethod;

	constructor (fetchMethod = globalThis.fetch, parseFeedMethod = parseFeed) {
		this.#fetchMethod = fetchMethod;
		this.#parseFeedMethod = parseFeedMethod;
	}

	async get (feedUrl, itemIndex) {
		let text;
		let items;

		try {
			const response = await this.#fetchMethod(feedUrl);

			assertResponseOk(response);

			text = await response.text();
		} catch (error) {
			if (error instanceof FetchError) {
				throw error;
			}
			throw new FetchError('Feed get failed.', { cause: error });
		}

		try {
			const feed = this.#parseFeedMethod(text);
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
}
