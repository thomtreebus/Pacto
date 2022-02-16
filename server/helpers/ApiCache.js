const NodeCache = require("node-cache");
const fetch = require("node-fetch");

// cache data lasts for 60 seconds before getting deleted.
const apiCache = new NodeCache({stdTTL: 60});

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