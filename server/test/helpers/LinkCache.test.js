const getPreview = require("../../helpers/LinkCache");
const Link = require("../../models/Link");
const { rest } = require("msw");
const { setupServer } = require("msw/node");

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

  beforeAll(() => {
    server.listen();
  })

  afterAll(() => {
    server.close();
  })

  beforeEach(() => {
    server.resetHandlers();
  })

  afterEach(() => {
    Link.deleteMany({});
  })

  it("should return a preview when available on first request", async () => {
    const preview = await getPreview(url);
    expect(preview).toBe({
      image: image,
      text: title,
      link: url
    })
  });

  it("should return a preview when available on second request, without making a fetch request", async () => {
    server.use(
      rest.post(`${process.env.LINKPREVIEW_URL}`, (req, res, ctx) => {
        return res(
          ctx.status(400)
        );
      })
    );

    const preview = await getPreview(url);
    expect(preview).toBe({
      image: image,
      text: title,
      link: url
    })
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
    expect(preview).toBe({
      image: image,
      text: title,
      link: url
    })
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