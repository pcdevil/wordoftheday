import { faker } from '@faker-js/faker';

export function fakeRequestUrl() {
	return faker.internet.url();
}

export function fakeRequestOptions(overrides = {}) {
	return {
		method: faker.helpers.arrayElement([
			'DELETE',
			'GET',
			'PATCH',
			'POST',
			'PUT',
		]),
		...overrides,
	};
}
