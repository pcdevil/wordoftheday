import Config from '#lib/config.mjs';
import MastodonPoster from '#lib/mastodon-poster.mjs';
import WordResolver from '#lib/word-resolver.mjs';

export default class WordOfTheDay {
	#config;
	#mastodonPoster;
	#wordResolver;

	constructor (
		config = new Config(),
		mastodonPoster = new MastodonPoster(),
		wordResolver = new WordResolver()
	) {
		this.#config = config;
		this.#mastodonPoster = mastodonPoster;
		this.#wordResolver = wordResolver;
	}

	async run (sourceName) {
		const sourceConfig = this.#getSourceConfig(sourceName);
		const word = await this.#wordResolver.get(sourceConfig.url, sourceConfig.itemIndex);
		await this.#mastodonPoster.post(
			this.#config.mastodon.baseUrl,
			this.#config.mastodon.accessToken,
			word,
			sourceConfig.hashtag
		);
	}

	#getSourceConfig (sourceName) {
		return this.#config.sources[sourceName];
	}
}
