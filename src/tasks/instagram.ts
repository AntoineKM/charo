import puppeteer from "puppeteer";
import Log from "../utils/log";

/**
 * Instagram task will contain 2 jobs:
 * 1. Getting instagram followers (from suggestions) by follow for follow
 * 2. Unfollow peole that we you follow since a week
 */

const PREFIX = "[instagram]";

const ROUTES = {
  BASE: "https://instagram.com/",
  EXPLORE: "https://instagram.com/explore/people/",

  API_DISCOVER: "https://i.instagram.com/api/v1/discover/ayml/",
};

const SESSION_ID = process.env.INSTAGRAM_SESSION_ID || "";

const instagramTask = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });

  const cookies = [
    {
      name: "sessionid",
      value: SESSION_ID,
      domain: ".instagram.com",
    },
    {
      name: "ig_did",
      value: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX",
      domXin: ".instagram.com",
    },
    {
      name: "csrftoken",
      value: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      domain: ".instagram.com",
    },
  ];

  try {
    // init browser
    Log.info(PREFIX, "init browser");
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    // setup request interceptor
    Log.info(PREFIX, "setup request interceptor");
    await page.setRequestInterception(true);
    await page.on("request", (request) => {
      request.continue();
    });

    await page.goto(ROUTES.BASE);

    // accept cookies
    Log.info(PREFIX, "accepting cookies...");
    await page.waitForSelector("div[role='presentation']");
    await page.click("div[role='presentation'] button[tabindex='0']");

    // set cookies
    Log.info(PREFIX, "set cookies", cookies);
    await page.setCookie(...cookies);

    // reload page
    Log.info(PREFIX, "reload page");
    await page.reload();

    // get suggestions
    Log.info(PREFIX, "get suggestions...");
    const suggestions: any[] = await getSuggestions(page);
    Log.info(PREFIX, `got ${suggestions.length} suggestions`);
  } catch (error) {
    Log.error(PREFIX, error);
  } finally {
    Log.info(PREFIX, "browser closed");
    //await browser.close();
  }
};

const getSuggestions = async (page: puppeteer.Page) => {
  let result = [];
  await page.goto(ROUTES.EXPLORE);
  await page.waitForResponse(async (response) => {
    if (response.request().resourceType() === "xhr") {
      if (response.url().includes(ROUTES.API_DISCOVER)) {
        const body = await response.json();
        result = body.groups[0].items;
        return true;
      }
    }
    return false;
  });

  return result;
};

export default instagramTask;
