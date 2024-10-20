import { faker } from '@faker-js/faker';

export function fakeFeedItem(overrides = {}) {
	return {
		link: faker.internet.url(),
		pubDate: faker.date.past(),
		title: faker.lorem.words({ min: 1, max: 2 }),
		...overrides,
	};
}

export function fakeFeedItems(length = faker.number.int({ min: 1, max: 5 }), overrides = []) {
	return Array.from({ length }, (_undefined, index) => fakeFeedItem(overrides[index]));
}
