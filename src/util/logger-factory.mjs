import { createWriteStream } from 'node:fs';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

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

function createFileStream(level, filePath) {
	return {
		level,
		stream: createWriteStream(filePath),
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

function createPrettyStream(customLevels, level, colorize) {
	const customColors = Object.entries(customLevels.colors)
		.map((entry) => entry.join(':'))
		.join(',');

	return {
		level,
		stream: pinoPretty({
			colorize,
			customColors,
			customLevels: customLevels.values,
			useOnlyCustomProps: false,
		}),
	};
}

export function loggerFactory(logConfig) {
	const customLevels = createCustomLevels();

	const logStreams = [];
	if (logConfig.filePath) {
		logStreams.push(createFileStream(logConfig.level, logConfig.filePath));
	}
	if (logConfig.pretty) {
		logStreams.push(createPrettyStream(customLevels, logConfig.level, logConfig.prettyColorize));
	}

	const multistream = logStreams.length
		? pino.multistream(logStreams)
		: undefined;

	return pino(createPinoOptions(customLevels, logConfig.level), multistream);
}
