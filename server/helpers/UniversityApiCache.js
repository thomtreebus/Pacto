const NodeCache = require("node-cache");
const fetch = require("node-fetch");

const uniEmailsApiCache = new NodeCache({stdTTL: 60});


const getUrls = async () => {
  try {
    if (uniEmailsApiCache.has("data")) {
      return uniEmailsApiCache.get("data")
    } else {
      const res = await fetch("http://universities.hipolabs.com/search?country=United%20Kingdom")
      const data = await res.json();
      uniEmailsApiCache.set("data", data)
      return data;
    }
  }
  catch (err){
    return {};
  }
}


module.exports = getUrls;