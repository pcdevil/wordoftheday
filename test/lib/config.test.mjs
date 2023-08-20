import { strict } from 'node:assert';
import {
	afterEach,
	beforeEach,
	describe,
	it,
	mock,
} from 'node:test';

import Config, { MissingEnvVariableError } from '#lib/config.mjs';

describe('Config', () => {
	const environmentVariableName = 'TEST_RUN';
	const environmentVariableValue = 'true';
	const mastodonAccessToken = 'e5K-I8_IMYUEI-u9IH4B6Qws_5KEXDK60LJOcY2SfJU';
	const mastodonBaseUrl = 'https://botsin.space';
	let dotenvMock;

	beforeEach(() => {
		dotenvMock = {
			config: mock.fn(({ processEnv }) => {
				processEnv.MASTODON_ACCESS_TOKEN = mastodonAccessToken;
				processEnv.MASTODON_BASE_URL = mastodonBaseUrl;
			}),
		};

		process.env[environmentVariableName] = environmentVariableValue;
	});

	afterEach(() => {
		delete process.env[environmentVariableName];
	});

	it('should call the dotenv module with a copy of the env variables when a new instance is created', () => {
		const config = new Config(dotenvMock);

		strict.equal(typeof config, 'object');
		strict.equal(dotenvMock.config.mock.calls.length, 1);

		const firstCall = dotenvMock.config.mock.calls[0];
		const { processEnv } = firstCall.arguments[0];

		strict.ok(processEnv !== process.env);
		strict.equal(processEnv[environmentVariableName], environmentVariableValue);
	});

	it('should expose the mastodon config coming from the dotenv', () => {
		const config = new Config(dotenvMock);

		strict.deepEqual(config.mastodon, {
			accessToken: mastodonAccessToken,
			baseUrl: mastodonBaseUrl,
		});
	});

	it('should expose sources as a id-config object', () => {
		const config = new Config(dotenvMock);

		strict.ok(typeof config.sources, 'object');
	});

	it('should throw a MissingEnvVariableError error when an environment variable is not defined.', () => {
		dotenvMock.config.mock.mockImplementation(() => {});

		strict.throws(
			() => new Config(dotenvMock),
			MissingEnvVariableError
		);
	});
});
