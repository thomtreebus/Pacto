const getPreview = require("../../helpers/LinkCache");
const Link = require("../../models/Link");
const { rest } = require("msw");
const { setupServer } = require("msw/node");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const supertest = require("supertest");
const app = require("../../app");

describe("LinkCache tests", () => {
  const url = "google.com";
  const title = "Google";
  const image = "https://www.google.com/images/logo.png"

  const server = setupServer(
		rest.post(`${process.env.LINKPREVIEW_URL}`, (req, res, ctx) => {
			return res(
				ctx.status(200),
				ctx.json({
					title: title,
          image: image
				})
			);
		})
	);

  beforeAll(async () => {
    server.listen({ onUnhandledRequest: "bypass" });
    await mongoose.connect(`${process.env.TEST_DB_CONNECTION_URL}`);
  })

  afterAll(async () => {
    server.close();
    await mongoose.connection.close();
  })

  beforeEach(() => {
    server.resetHandlers();
  })

  afterEach(async () => {
    await Link.deleteMany({});
  })

  it("should return a preview when available on first request", async () => {
    const preview = await getPreview(url);
    expect(preview.image).toBe(image);
    expect(preview.text).toBe(title);
    expect(preview.link).toBe(url);
  });

  it("should return a preview when available on second request, without making a fetch request", async () => {
    await getPreview(url);
    server.use(
      rest.post(`${process.env.LINKPREVIEW_URL}`, (req, res, ctx) => {
        return res(
          ctx.status(400)
        );
      })
    );

    const preview = await getPreview(url);
    expect(preview.image).toBe(image);
    expect(preview.text).toBe(title);
    expect(preview.link).toBe(url);
  });

  it("should return null when a preview is not available", async () => {
    server.use(
      rest.post(`${process.env.LINKPREVIEW_URL}`, (req, res, ctx) => {
        return res(
          ctx.status(400)
        );
      })
    );

    const preview = await getPreview(url);
    expect(preview).toBe(null);
  });

  it("should create a link document on first request if a preview is available", async () => {
    await getPreview(url);
    const preview = await Link.findOne({ link: url })
    expect(preview.image).toBe(image);
    expect(preview.text).toBe(title);
    expect(preview.link).toBe(url);
  });

  it("should not create link document on first request if a preview is not available", async () => {
    server.use(
      rest.post(`${process.env.LINKPREVIEW_URL}`, (req, res, ctx) => {
        return res(
          ctx.status(400)
        );
      })
    );

    await getPreview(url);
    const preview = await Link.findOne({ link: url });
    expect(preview).toBe(null);
  });
});