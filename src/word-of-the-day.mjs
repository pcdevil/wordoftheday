import { config } from '#lib/config.mjs';
import { MastodonPoster } from '#lib/mastodon-poster.mjs';
import { WordResolver } from '#lib/word-resolver.mjs';
import { loggerFactory } from '#util/logger-factory.mjs';

export class WordOfTheDay {
	#logger;
	#mastodonPoster;
	#wordResolver;

	constructor(
		logger = loggerFactory()
	) {
		this.#logger = logger.child({ name: this.constructor.name });
		this.#mastodonPoster = new MastodonPoster(logger);
		this.#wordResolver = new WordResolver(logger);
	}

	async run() {
		try {
			this.#logger.debug('run start', { sourceName: config.source.name });

			const word = await this.#wordResolver.get();
			await this.#mastodonPoster.post(word);

			this.#logger.debug('run successful');
		} catch (error) {
			this.#logger.warn('run failed', { error });
			throw error;
		}
	}
}
