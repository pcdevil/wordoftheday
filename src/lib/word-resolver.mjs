import RssParser from 'rss-parser';

export class NoItemsError extends Error {}
export class RssParserError extends Error {}

export default class WordResolver {
	#rssParser;
	#url;

	constructor (url, rssParser = new RssParser()) {
		this.#rssParser = rssParser;
		this.#url = url;
	}

	async get () {
		let items;

		try {
			const output = await this.#rssParser.parseURL(this.#url);
			items = output.items;
		} catch (error) {
			throw new RssParserError('Rss parser call failed.', { cause: error });
		}

		const firstItem = items[0];

		if (!firstItem) {
			throw new NoItemsError('No items in the rss feed.');
		}

		const date = new Date(firstItem.isoDate);
		const word = firstItem.title;
		const url = encodeURI(firstItem.link);

		return {
			date,
			word,
			url,
		};
	}
}
