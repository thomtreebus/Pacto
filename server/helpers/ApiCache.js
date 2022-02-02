const NodeCache = require("node-cache");
const fetch = require("node-fetch");

// cache lasts for 60 seconds
const apiCache = new NodeCache({stdTTL: 60});

const getUrls = async (url) => {
  try {
    if (apiCache.has(url)) {
      return apiCache.get(url)
    } else {
      const res = await fetch(url)
      const data = await res.json();
      apiCache.set(url, data)
      return data;
    }
  }
  catch (err){
    return {};
  }
}

module.exports = getUrls;