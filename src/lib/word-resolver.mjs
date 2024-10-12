import { parseFeed } from 'htmlparser2';
// project imports
import { UndefinedConfigError, config } from '#lib/config.mjs';
import { NamedError } from '#util/named-error.mjs';
import { request } from '#util/request.mjs';

export class FeedParserError extends NamedError {}
export class NoItemError extends NamedError {}

export class WordResolver {
	#logger;

	constructor(logger) {
		this.#logger = logger.child({ name: this.constructor.name });
	}

	async get() {
		if (!config.source.url) throw new UndefinedConfigError(`The source.url config variable is not defined.`);
		if (Number.isNaN(config.source.itemIndex)) throw new UndefinedConfigError(`The source.itemIndex config variable is not an integer.`);

		let items;

		const response = await request(config.source.url, {}, this.#logger);
		const text = await response.text();

		try {
			const feed = this.#parseFeedWithMeasure(text);
			items = feed.items;
		} catch (error) {
			throw new FeedParserError('Rss parser call failed.', { cause: error });
		}

		const item = items.at(config.source.itemIndex);

		if (!item) {
			throw new NoItemError(`No item found in the rss feed with ${config.source.itemIndex} index.`);
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
			return parseFeed(text);
		} finally {
			this.#logger.mark(`${measureName} end`);
			this.#logger.measure(measureName, `${measureName} start`, `${measureName} end`);
		}
	}
}
