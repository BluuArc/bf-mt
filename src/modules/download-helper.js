
/**
 * Wrapper function for getting JSON from a URL. Replaced @/store/download-worker
 * @param {string} url
 * @returns {Object}
 */
export function getJson (url) {
	return fetch(url)
	.then(res => res.ok
		? res.json()
		: Promise.reject(res.statusText));
}