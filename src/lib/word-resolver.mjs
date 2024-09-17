import { parseFeed } from 'htmlparser2';
// project imports
import { NamedError } from '#src/util/named-error.mjs';
import { request } from '#src/util/request.mjs';

export class FeedParserError extends NamedError {}
export class NoItemError extends NamedError {}

export class WordResolver {
	#logger;
	#parseFeedMethod;
	#requestMethod;

	constructor(logger, requestMethod = request, parseFeedMethod = parseFeed) {
		this.#logger = logger.child({ name: this.constructor.name });
		this.#requestMethod = requestMethod;
		this.#parseFeedMethod = parseFeedMethod;
	}

	async get(feedUrl, itemIndex) {
		let items;

		const response = await this.#requestMethod(feedUrl, {}, this.#logger);
		const text = await response.text();

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
