const NodeCache = require("node-cache");
const fetch = require("node-fetch");

// cache data lasts for 60 seconds before getting deleted.
const apiCache = new NodeCache({stdTTL: 60});

/**
 * Caches the data returned by an API for 60 seconds.
 * @param url - URL of an API GET request to be cached
 * @returns - Fetched json data of the api request.
 */
const getUrls = async (url) => {
  try {
    // cache contains data
    if (apiCache.has(url)) {
      return apiCache.get(url)
    } else {
      const res = await fetch(url)
      const data = await res.json();
      // data is added to cache
      apiCache.set(url, data)
      return data;
    }
  }
  catch (err){
    throw Error("Error accessing universities json file.");
  }
}

module.exports = getUrls;