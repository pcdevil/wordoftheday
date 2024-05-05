import { parseFeed } from 'htmlparser2';

import { NamedError, RequestError, assertResponseOk, requestWithMeasure } from '#util';

export class FeedParserError extends NamedError {}
export class NoItemError extends NamedError {}

export class WordResolver {
	#logger;
	#parseFeedMethod;
	#requestWithMeasureMethod;

	constructor(logger, requestWithMeasureMethod = requestWithMeasure, parseFeedMethod = parseFeed) {
		this.#logger = logger.child({ name: this.constructor.name });
		this.#requestWithMeasureMethod = requestWithMeasureMethod;
		this.#parseFeedMethod = parseFeedMethod;
	}

	async get(feedUrl, itemIndex) {
		let text;
		let items;

		try {
			const response = await this.#requestWithMeasureMethod(feedUrl, {}, this.#logger);

			assertResponseOk(response);

			text = await response.text();
		} catch (error) {
			if (error instanceof RequestError) {
				throw error;
			}
			throw new RequestError('Feed get failed.', { cause: error });
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

	#parseFeedWithMeasure(text) {
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
