const Link = require("../models/Link");
const fetch = require("node-fetch")

const getPreview = async (url) => {
  const preview = await Link.findOne({ link: url })
  if (preview !== null) {
    return preview;
  }
  return cacheLinkPreview(url);
}

const cacheLinkPreview = async (url) => {
  try {
    const res = await fetch(`${process.env.LINKPREVIEW_URL}`, {
      method: "POST",
      body: JSON.stringify({
        key: process.env.LINKPREVIEW_KEY,
        q: url
      })
    })

    if (!res.ok) throw Error();
    const data = await res.json();
    return await Link.create({ image: data.image, text: data.title, link: url});
  } catch (err) {
    return null;
  }
}

module.exports = getPreview;
