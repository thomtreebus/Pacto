const Link = require("../models/Link");
const fetch = require("node-fetch")

const getPreview = async (url) => {
  const preview = await Link.findOne({ link: url })
  if (preview !== null) {
    return preview;
  }
  console.log("URL not cached, querying: " + url);
  return cacheLinkPreview(url);
}

const cacheLinkPreview = async (url) => {
  //console.log("fetch request sent: " + url);
  try {
    const res = await fetch(`${process.env.REACT_APP_LINKPREVIEW_URL}/?key=${process.env.REACT_APP_LINKPREVIEW_KEY}&q=${url}`, {
      method: "GET",
    })
    if (!res.ok) return null;
    const data = await res.json();
    return await Link.create({ image: data.image, text: data.title, link: url});
  } catch (err) {
    return null;
  }
}

module.exports = getPreview;
