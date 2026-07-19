// simple in-memory cache shared across admin pages (cleared on full reload).
// Pages show cached data instantly, then refresh in the background.
export const apiCache = new Map();
