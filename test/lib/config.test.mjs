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
	const logLevel = 'warn';
	const logFilePath = '/tmp/test.log';
	const logPretty = 'true';
	const mastodonAccessToken = 'e5K-I8_IMYUEI-u9IH4B6Qws_5KEXDK60LJOcY2SfJU';
	const mastodonBaseUrl = 'https://botsin.space';
	let ciEnv = 'false';
	let dotenvMock;

	beforeEach(() => {
		dotenvMock = {
			config: mock.fn(({ processEnv }) => {
				processEnv.CI = ciEnv;

				processEnv.LOG_LEVEL = logLevel;
				processEnv.LOG_FILE_PATH = logFilePath;
				processEnv.LOG_PRETTY = logPretty;

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

		strict.equal(typeof config.sources, 'object');
	});

	it('should expose the log config', () => {
		const config = new Config(dotenvMock);

		strict.deepEqual(config.log, {
			level: logLevel,
			filePath: logFilePath,
			pretty: true,
			prettyColorize: true,
		});
	});

	it('should turn off coloured pretty log on CI environment', () => {
		ciEnv = 'true';

		const config = new Config(dotenvMock);

		strict.equal(config.log.prettyColorize, false);
	});

	it('should throw a MissingEnvVariableError error when an environment variable is not defined.', () => {
		dotenvMock.config.mock.mockImplementation(() => {});

		strict.throws(
			() => new Config(dotenvMock),
			MissingEnvVariableError
		);
	});
});
