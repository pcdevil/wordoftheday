import { createWriteStream } from 'node:fs';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
// project imports
import { config } from '#src/lib/config.mjs';

let mainLogger;
const namedLoggers = new Map();

export function getLogger(name) {
	mainLogger ??= createLogger();
	if (!name) return mainLogger;

	if (namedLoggers.has(name)) return namedLoggers.get(name);

	const namedLogger = mainLogger.child({ name });
	namedLoggers.set(name, namedLogger);

	return namedLogger;
}

export function clearLoggers() {
	mainLogger = undefined;
	namedLoggers.clear();
}

function createCustomLevels() {
	// set custom log levels based on existing one
	const relativeLogLevel = pino.levels.values.debug;
	return {
		colors: {
			mark: 'blue',
			measure: 'blue',
		},
		values: {
			mark: relativeLogLevel + 1,
			measure: relativeLogLevel + 2,
		},
	};
}

function createPinoLogHooks(customLevels) {
	return {
		logMethod(inputArgs, method, level) {
			// handle "mark" logs
			if (level === customLevels.values.mark) {
				const [markName] = inputArgs;
				performance.mark(markName);
				return method.apply(this, [markName]);
			}

			// handle "measure" logs
			if (level === customLevels.values.measure) {
				const [measureName, startMark, endMark] = inputArgs;
				const { duration, startTime } = performance.measure(measureName, startMark, endMark);
				const measure = {
					duration,
					startTime,
				};
				return method.apply(this, [measure, measureName]);
			}

			// flip string message and object parameters
			// based on: https://getpino.io/#/docs/api?id=logmethod
			if (inputArgs.length >= 2) {
				const [firstArg, secondArg, ...restArgs] = inputArgs;
				return method.apply(this, [secondArg, firstArg, ...restArgs]);
			}

			return method.apply(this, inputArgs);
		},
	};
}

function createPinoOptions(customLevels, level) {
	const options = {
		base: undefined,
		customLevels: customLevels.values,
		hooks: createPinoLogHooks(customLevels),
	};

	if (level !== undefined) {
		options.level = level;
	}

	return options;
}

function createLogger() {
	const customLevels = createCustomLevels();

	const logStreams = [];

	if (config.log.filePath) {
		logStreams.push({
			level: config.log.level,
			stream: createWriteStream(config.log.filePath),
		});
	}

	if (config.log.pretty) {
		const customColors = Object.entries(customLevels.colors)
			.map((entry) => entry.join(':'))
			.join(',');

		logStreams.push({
			level: config.log.level,
			stream: pinoPretty({
				colorize: config.log.prettyColorize,
				customColors,
				customLevels: customLevels.values,
				useOnlyCustomProps: false,
			}),
		});
	}

	const multistream = logStreams.length
		? pino.multistream(logStreams)
		: undefined;

	return pino(createPinoOptions(customLevels, config.log.level), multistream);
}
