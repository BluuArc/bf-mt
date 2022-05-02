
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

/**
 * Wrapper function for getting plain text from a URL.
 * @param {string} url
 * @returns {String}
 */
 export function getText (url) {
	return fetch(url)
		.then(res => res.ok
			? res.text()
			: Promise.reject(res.statusText));
}
