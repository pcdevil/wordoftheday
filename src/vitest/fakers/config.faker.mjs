import { faker } from '@faker-js/faker';

export function fakeSourceConfig(overrides = {}) {
	return {
		name: faker.company.name(),
		url: faker.internet.url(),
		itemIndex: faker.number.int({ min: 0, max: 5 }),
		...overrides,
	};
}

export function fakePostConfig(overrides = {}) {
	return {
		hashtag: '#' + faker.company.buzzNoun().replace(/-(.)/, (match) => match.substring(1).toUpperCase()),
		language: faker.helpers.arrayElement(['en-GB', 'fr-FR', 'hu-HU']),
		visibility: faker.helpers.arrayElement([
			'direct',
			'private',
			'public',
			'unlisted',
		]),
		...overrides,
	};
}

export function fakeLogConfig(overrides = {}) {
	return {
		filePath: faker.system.filePath(),
		level: faker.helpers.arrayElement([
			'debug',
			'error',
			'fatal',
			'info',
			'silent',
			'trace',
			'warn',
		]),
		pretty: faker.datatype.boolean(),
		prettyColorize: faker.datatype.boolean(),
		...overrides,
	};
}

export function fakeMastodonConfig(overrides = {}) {
	return {
		accessToken: faker.string.alphanumeric(42),
		baseUrl: faker.internet.url({ appendSlash: false }),
		...overrides,
	};
}

export function fakeConfig(overrides = {}) {
	return {
		log: fakeLogConfig(overrides.log),
		mastodon: fakeMastodonConfig(overrides.mastodon),
		post: fakePostConfig(overrides.post),
		source: fakeSourceConfig(overrides.source),
	};
}
