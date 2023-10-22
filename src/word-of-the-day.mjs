import Config from '#lib/config.mjs';
import MastodonPoster from '#lib/mastodon-poster.mjs';
import WordResolver from '#lib/word-resolver.mjs';
import { loggerFactory } from '#util/logger-factory.mjs';

export class InvalidSourceName extends Error {}

export default class WordOfTheDay {
	#config;
	#logger;
	#mastodonPoster;
	#wordResolver;

	constructor (
		config = new Config(),
		logger = loggerFactory(config.log),
		mastodonPoster = new MastodonPoster(logger),
		wordResolver = new WordResolver(logger)
	) {
		this.#config = config;
		this.#logger = logger.child({ name: this.constructor.name });
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
		if (!this.#config.sources[sourceName]) {
			throw new InvalidSourceName(`Referenced source "${sourceName}" is not configured.`);
		}

		return this.#config.sources[sourceName];
	}
}
