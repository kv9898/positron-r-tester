import { tryAcquirePositronApi, type PositronApi } from '@posit-dev/positron';

export function getPositronApi(): PositronApi {

	const api = tryAcquirePositronApi();
	if (!api) {
		throw new Error('The Positron API is unavailable. Open this extension in Positron.');
	}
	return api;
}
