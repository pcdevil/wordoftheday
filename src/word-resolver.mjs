import RssParser from 'rss-parser';

export default class WordResolver {
	#rssParser;
	#url;

	constructor (url, rssParser = new RssParser()) {
		this.#rssParser = rssParser;
		this.#url = url;
	}

	async get () {
		const { items } = await this.#rssParser.parseURL(this.#url);

		const firstItem = items[0];

		if (!firstItem) {
			return;
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
