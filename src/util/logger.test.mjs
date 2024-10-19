import { createWriteStream } from 'node:fs';
import pino from 'pino';
import pinoPretty from 'pino-pretty';
import { beforeEach, describe, expect, it, vi } from 'vitest';
// project imports
import { config } from '#src/lib/config.mjs';
import { clearLoggers, getLogger } from './logger.mjs';

vi.mock('node:fs');
vi.mock('pino');
vi.mock('pino-pretty');
vi.mock('#src/lib/config.mjs');
const mocks = {
	config: vi.mocked(config),
	createWriteStream: vi.mocked(createWriteStream),
	pino: vi.mocked(pino),
	pinoPretty: vi.mocked(pinoPretty),
};

// unmock subject module
vi.unmock('#src/util/logger.mjs');

describe('getLogger', () => {
	let performanceMock;
	let pinoLoggerMock;

	beforeEach(() => {
		vi.spyOn(mocks.config, 'log', 'get').mockReturnValue({
			level: 'warn',
		});

		pinoLoggerMock = {
			child: vi.fn(),
		};

		performanceMock = {
			mark: vi.fn(),
			measure: vi.fn(),
		};
		vi.spyOn(globalThis, 'performance', 'get').mockReturnValue(performanceMock);

		mocks.pino.mockReturnValue(pinoLoggerMock);
		mocks.pino.levels = {
			values: {
				debug: 42,
			},
		};
		mocks.pino.multistream = vi.fn();

		clearLoggers();
	});

	it('should create and return a logger based on the config', () => {
		const logger = getLogger();

		expect(mocks.pino).toHaveBeenCalledWith(
			{
				base: undefined,
				customLevels: {
					mark: mocks.pino.levels.values.debug + 1,
					measure: mocks.pino.levels.values.debug + 2,
				},
				hooks: {
					logMethod: expect.any(Function),
				},
				level: mocks.config.log.level,
			},
			undefined
		);
		expect(mocks.pino.multistream).not.toHaveBeenCalled();
		expect(logger).toBe(pinoLoggerMock);
	});

	it('should create a named child when a name parameter is passed', () => {
		const name = 'test';
		const pinoChildLoggerMock = {};
		pinoLoggerMock.child.mockReturnValue(pinoChildLoggerMock);

		const namedLogger = getLogger(name);

		expect(pinoLoggerMock.child).toHaveBeenCalledWith({ name });
		expect(namedLogger).toBe(pinoChildLoggerMock);
	});

	it('should not create a new instance when called repeatedly with a name parameter', () => {
		const name = 'test';
		const pinoChildLoggerMock = {};
		pinoLoggerMock.child.mockReturnValue(pinoChildLoggerMock);

		// ensure it's called once
		getLogger(name);

		// clear the mock's history
		pinoLoggerMock.child.mockClear();

		// call it again
		getLogger(name);

		expect(pinoLoggerMock.child).not.toHaveBeenCalled();
	});

	it('should not create a new instance when called repeatedly', () => {
		// ensure it's called once
		getLogger();

		// clear the mock's history
		mocks.pino.mockClear();

		// call it again
		getLogger();

		expect(mocks.pino).not.toHaveBeenCalled();
	});

	describe('streams', () => {
		let pinoPrettyStreamMock;
		let pinoStreamMock;
		let writeStreamMock;

		beforeEach(() => {
			writeStreamMock = {};
			mocks.createWriteStream.mockReturnValue(writeStreamMock);

			pinoPrettyStreamMock = {};
			mocks.pinoPretty.mockReturnValue(pinoPrettyStreamMock);

			pinoStreamMock = {};
			mocks.pino.multistream.mockReturnValue(pinoStreamMock);
		});

		it('should create a file stream when the file path is defined', () => {
			mocks.config.log.filePath = '/tmp/test.log';

			getLogger();

			expect(mocks.createWriteStream).toHaveBeenCalledWith(mocks.config.log.filePath);
			expect(mocks.pino.multistream).toHaveBeenCalledWith([
				{ level: mocks.config.log.level, stream: writeStreamMock },
			]);
			expect(mocks.pino).toHaveBeenCalledWith(expect.anything(), pinoStreamMock);
		});

		it('should create a pino-pretty stream when the config is enabled', () => {
			mocks.config.log.pretty = true;
			mocks.config.log.prettyColorize = true;

			getLogger();

			expect(mocks.pinoPretty).toHaveBeenCalledWith({
				colorize: true,
				customColors: 'mark:blue,measure:blue',
				customLevels: {
					mark: mocks.pino.levels.values.debug + 1,
					measure: mocks.pino.levels.values.debug + 2,
				},
				useOnlyCustomProps: false,
			});
			expect(mocks.pino.multistream).toHaveBeenCalledWith([
				{ level: mocks.config.log.level, stream: pinoPrettyStreamMock },
			]);
			expect(mocks.pino).toHaveBeenCalledWith(expect.anything(), pinoStreamMock);
		});

		it('should create a pino-pretty stream without colours when the config is disabled', () => {
			mocks.config.log.pretty = true;
			mocks.config.log.prettyColorize = false;

			getLogger();

			expect(mocks.pinoPretty).toHaveBeenCalledWith(expect.objectContaining({ colorize: false }));
		});
	});

	describe('logMethod hook', () => {
		let logMethodMock;
		let customLevels;
		let logMethodHook;

		beforeEach(() => {
			logMethodMock = vi.fn();

			mocks.config.log.level = 'trace';

			getLogger();

			const [optionsArg] = mocks.pino.mock.calls[0];
			customLevels = optionsArg.customLevels;
			logMethodHook = optionsArg.hooks.logMethod;
		});

		it('should handle "mark" events', () => {
			const markName = 'mark 123';
			logMethodHook([markName], logMethodMock, customLevels.mark);

			expect(performanceMock.mark).toHaveBeenCalledWith(markName);
			expect(logMethodMock).toHaveBeenCalledWith(markName);
		});

		it('should handle "measure" events', () => {
			const duration = 2964.4601969718933;
			const startTime = 5865.243420124054;
			performanceMock.measure.mockReturnValue({ duration, startTime });

			const measureName = 'measure 123';
			const startMark = 'mark 456';
			const endMark = 'mark 789';
			logMethodHook([measureName, startMark, endMark], logMethodMock, customLevels.measure);

			expect(performanceMock.measure).toHaveBeenCalledWith(measureName, startMark, endMark);
			expect(logMethodMock).toHaveBeenCalledWith({ duration, startTime }, measureName);
		});

		it('should flip the object and string arguments', () => {
			const logObject = {};
			const logMessage = 'message';
			logMethodHook([logMessage, logObject], logMethodMock, 'warn');

			expect(logMethodMock).toHaveBeenCalledWith(logObject, logMessage);
		});
	});
});
