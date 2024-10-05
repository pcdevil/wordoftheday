import { Config } from '#lib/config.mjs';
import { MastodonPoster } from '#lib/mastodon-poster.mjs';
import { WordResolver } from '#lib/word-resolver.mjs';
import { loggerFactory } from '#util/logger-factory.mjs';

export class WordOfTheDay {
	#config;
	#logger;
	#mastodonPoster;
	#wordResolver;

	constructor(
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

	async run() {
		try {
			this.#logger.debug('run start', {
				sourceName: this.#config.source.name,
			});
			const word = await this.#wordResolver.get(this.#config.source.url, this.#config.source.itemIndex);
			await this.#mastodonPoster.post(
				this.#config.mastodon.baseUrl,
				this.#config.mastodon.accessToken,
				word,
				this.#config.source.postHashtag
			);
			this.#logger.debug('run successful');
		} catch (error) {
			this.#logger.warn('run failed', {
				error,
			});
			throw error;
		}
	}
}
