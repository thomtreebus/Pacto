const Link = require("../models/Link");
const fetch = require("node-fetch")

/**
 * Return a cached link preview for a given URL. If the URL is not in cache,
 * add it to the cache
 * 
 * @param url - The URL to return from the cache 
 * @returns - The link preview
 */
const getPreview = async (url) => {
  const preview = await Link.findOne({ link: url })
  if (preview !== null) {
    return preview;
  }
  return cacheLinkPreview(url);
}

/**
 * Add a given URL to the link cache
 * @param url - The URL to be added to cache 
 * @returns - The cached URL
 */
const cacheLinkPreview = async (url) => {
  try {
    const res = await fetch(`${process.env.LINKPREVIEW_URL}`, {
      method: "POST",
      body: JSON.stringify({
        key: process.env.LINKPREVIEW_KEY, // API key for the Link Preview API
        q: url // The URL to get a preview for
      })
    })

    if (!res.ok) throw Error();
    const data = await res.json();
    // Store the link preview in the database 
    const link = await Link.create({ image: data.image, text: data.title, link: url });
  
    return link;

  } catch (err) {
    return null;
  }
}

module.exports = getPreview;
