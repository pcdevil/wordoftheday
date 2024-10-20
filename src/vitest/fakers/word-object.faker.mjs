import { faker } from '@faker-js/faker';

export function fakeWordObject(overrides = {}) {
	return {
		date: faker.date.past(),
		url: faker.internet.url(),
		word: faker.lorem.word(),
		...overrides,
	};
}
