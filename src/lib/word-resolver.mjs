import RssParser from 'rss-parser';

export class NoItemError extends Error {}
export class RssParserError extends Error {}

export default class WordResolver {
	#rssParser;

	constructor (rssParser = new RssParser()) {
		this.#rssParser = rssParser;
	}

	async get (feedUrl, itemIndex) {
		let items;

		try {
			const output = await this.#rssParser.parseURL(feedUrl);
			items = output.items;
		} catch (error) {
			throw new RssParserError('Rss parser call failed.', { cause: error });
		}

		const item = items.at(itemIndex);

		if (!item) {
			throw new NoItemError(`No item found in the rss feed with ${itemIndex} index.`);
		}

		const date = new Date(item.isoDate);
		const word = item.title;
		const url = encodeURI(item.link);

		return {
			date,
			word,
			url,
		};
	}
}
