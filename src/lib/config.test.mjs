import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { Config } from './config.mjs';

describe('Config', () => {
	const envVariables = {
		CI: 'false',

		LOG_LEVEL: 'warn',
		LOG_FILE_PATH: '/tmp/test.log',
		LOG_PRETTY: 'true',

		SOURCE_NAME: 'Merriam-Webster',
		SOURCE_URL: 'https://www.merriam-webster.com/wotd/feed/rss2',
		SOURCE_ITEM_INDEX: '0',
		SOURCE_POST_HASHTAG: '#MerriamWebster',

		MASTODON_ACCESS_TOKEN: 'e5K-I8_IMYUEI-u9IH4B6Qws_5KEXDK60LJOcY2SfJU',
		MASTODON_BASE_URL: 'https://botsin.space',
	};
	let dotenvMock;

	beforeEach(() => {
		dotenvMock = {
			config: vi.fn().mockImplementation(({ processEnv }) => {
				Object.assign(processEnv, envVariables);
			}),
		};
	});

	it('should call the dotenv module with a copy of the env variables when a new instance is created', () => {
		const config = new Config(dotenvMock);

		expect(config).toBeInstanceOf(Object);
		expect(dotenvMock.config).toHaveBeenCalled();

		const [{ processEnv }] = dotenvMock.config.mock.calls[0];

		expect(processEnv).not.toBe(process.env);
	});

	it('should expose the configs', () => {
		const config = new Config(dotenvMock);

		expect(config.mastodon).toEqual({
			accessToken: envVariables.MASTODON_ACCESS_TOKEN,
			baseUrl: envVariables.MASTODON_BASE_URL,
		});
		expect(config.source).toEqual({
			name: envVariables.SOURCE_NAME,
			url: envVariables.SOURCE_URL,
			itemIndex: parseInt(envVariables.SOURCE_ITEM_INDEX),
			postHashtag: envVariables.SOURCE_POST_HASHTAG,
		});
		expect(config.log).toEqual({
			level: envVariables.LOG_LEVEL,
			filePath: envVariables.LOG_FILE_PATH,
			pretty: true,
			prettyColorize: true,
		});
	});

	it('should turn off coloured pretty log on CI environment', () => {
		dotenvMock.config.mockImplementation(({ processEnv }) => {
			Object.assign(processEnv, { ...envVariables, CI: 'true' });
		});

		const config = new Config(dotenvMock);

		expect(config.log.prettyColorize).toBeFalsy();
	});
});
