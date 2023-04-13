import { Config } from '#lib/config.mjs';
import { MastodonPoster } from '#lib/mastodon-poster.mjs';
import { WordResolver } from '#lib/word-resolver.mjs';
import { loggerFactory } from '#util/logger-factory.mjs';

export class InvalidSourceNameError extends Error {}

export class WordOfTheDay {
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
		try {
			this.#logger.debug('run start', {
				sourceName,
			});
			const sourceConfig = this.#getSourceConfig(sourceName);
			const word = await this.#wordResolver.get(sourceConfig.url, sourceConfig.itemIndex);
			await this.#mastodonPoster.post(
				this.#config.mastodon.baseUrl,
				this.#config.mastodon.accessToken,
				word,
				sourceConfig.hashtag
			);
			this.#logger.debug('run successful');
		} catch (error) {
			this.#logger.warn('run failed', {
				error,
			});
			throw error;
		}
	}

	#getSourceConfig (sourceName) {
		if (!this.#config.sources[sourceName]) {
			throw new InvalidSourceNameError(`Referenced source "${sourceName}" is not configured.`);
		}

		return this.#config.sources[sourceName];
	}
}
