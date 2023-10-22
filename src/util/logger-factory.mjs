import fs from 'fs';
import pino from 'pino';
import pinoPretty from 'pino-pretty';

function createCustomLevels (pinoModule) {
	// set custom log levels based on existing one
	const relativeLogLevel = pinoModule.levels.values.debug;
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

function createFileStream (fsModule, level, filePath) {
	return {
		level,
		stream: fsModule.createWriteStream(filePath),
	};
}

function createPinoLogHooks (performanceInterface, customLevels) {
	return {
		logMethod (inputArgs, method, level) {
			// handle "mark" logs
			if (level === customLevels.values.mark) {
				const [markName] = inputArgs;
				performanceInterface.mark(markName);
				return method.apply(this, [markName]);
			}

			// handle "measure" logs
			if (level === customLevels.values.measure) {
				const [measureName, startMark, endMark] = inputArgs;
				const { duration, startTime } = performanceInterface.measure(measureName, startMark, endMark);
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

function createPinoOptions (performanceInterface, customLevels, level) {
	const options = {
		base: undefined,
		customLevels: customLevels.values,
		hooks: createPinoLogHooks(performanceInterface, customLevels),
	};

	if (level !== undefined) {
		options.level = level;
	}

	return options;
}

function createPrettyStream (pinoPrettyModule, customLevels, level, colorize) {
	const customColors = Object.entries(customLevels.colors)
		.map((entry) => entry.join(':'))
		.join(',');

	return {
		level,
		stream: pinoPrettyModule({
			colorize,
			customColors,
			customLevels: customLevels.values,
			useOnlyCustomProps: false,
		}),
	};
}

export function loggerFactory (logConfig, performanceInterface = globalThis.performance, fsModule = fs, pinoModule = pino, pinoPrettyModule = pinoPretty) {
	const customLevels = createCustomLevels(pinoModule);

	const logStreams = [];
	if (logConfig.filePath) {
		logStreams.push(createFileStream(fsModule, logConfig.level, logConfig.filePath));
	}
	if (logConfig.pretty) {
		logStreams.push(createPrettyStream(pinoPrettyModule, customLevels, logConfig.level, logConfig.prettyColorize));
	}

	const multistream = logStreams.length
		? pinoModule.multistream(logStreams)
		: undefined;

	return pinoModule(createPinoOptions(performanceInterface, customLevels, logConfig.level), multistream);
}
