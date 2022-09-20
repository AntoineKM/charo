import puppeteer, { ContinueRequestOverrides } from "puppeteer";
import Instagram from "../models/Instagram";
import Log from "../utils/log";

/**
 * Instagram task will contain 2 jobs:
 * 1. Getting instagram followers (from suggestions) by follow for follow
 * 2. Unfollow peole that we you follow since a week
 */

const PREFIX = "[instagram]";

const ROUTES = {
  BASE: "https://instagram.com/",
  EXPLORE: "https://instagram.com/explore/people",

  API_DISCOVER: "https://i.instagram.com/api/v1/discover/ayml",
  API_FRIENDS: "https://i.instagram.com/api/v1/web/friendships",
};

const SESSION_ID = process.env.INSTAGRAM_SESSION_ID || "";

let headers: {
  [key: string]: string;
} = {};

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
      // set headers to post request headers
      if (request.method() === "POST") {
        // Log.info(PREFIX, "update headers");
        if (request.headers().cookie) headers = request.headers();
      }

      if (request.url().includes(ROUTES.API_FRIENDS)) {
        const data = {
          method: "POST",
          mode: "cors",
          cache: "no-cache",
          credentials: "same-origin",
          redirect: "follow",
          referrerPolicy: "strict-origin-when-cross-origin",
          headers: {
            "Sec-GPC": "1",
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "/",
            "X-CSRFToken": getCookie(headers?.cookie, "csrftoken"),
          },
        } as ContinueRequestOverrides;
        request.continue(data);
      } else {
        request.continue();
      }
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

    // get all instagram accounts from database
    const accounts = await Instagram.find();

    // check if we have accounts that we follow since 1 day
    const accountsToUnfollow = accounts.filter((account) => {
      const createdAt = new Date(account.createdAt);
      const now = new Date();
      const diff = now.getTime() - createdAt.getTime();
      const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
      // const diffDays = Math.ceil(diff / 1000); // <-- for testing
      return diffDays >= 1;
    });

    // unfollow accounts
    for (const account of accountsToUnfollow) {
      await unfollow(page, account);
      await page.waitForTimeout(1000);
    }

    // get suggestions
    Log.info(PREFIX, "get suggestions...");
    const suggestions: any[] = await getSuggestions(page);
    Log.info(PREFIX, `got ${suggestions.length} suggestions`);

    // get public accounts
    Log.info(PREFIX, "get public accounts...");
    const publicAccounts = suggestions.filter((suggestion) => {
      return suggestion.user.is_private === false;
    });
    Log.info(PREFIX, `got ${publicAccounts.length} public accounts`);

    // follow public accounts
    Log.info(PREFIX, "follow public accounts...");
    for (let i = 0; i < publicAccounts.length; i++) {
      const account = publicAccounts[i];
      await follow(page, account);
      await page.waitForTimeout(1000);
    }
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

const follow = async (page: puppeteer.Page, account: any) => {
  const url = `${ROUTES.API_FRIENDS}/${account.user.pk}/follow/`;
  await page.goto(url);
  Log.info(PREFIX, "followed", account.user.username);

  Log.info(PREFIX, `saving ${account.user.username} to database...`);
  await new Instagram({
    account,
    createdAt: new Date(),
  }).save();
  Log.info(PREFIX, "saved", account.user.username);
};

const unfollow = async (page: puppeteer.Page, item: any) => {
  const url = `${ROUTES.API_FRIENDS}/${item.account.user.pk}/unfollow/`;
  await page.goto(url);
  Log.info(PREFIX, "unfollowed", item.account.user.username);

  Log.info(PREFIX, `removing ${item.account.user.username} from database...`);
  await Instagram.deleteOne({ _id: item._id });
  Log.info(PREFIX, "removed", item.account.user.username);
};

const getCookie = (cookies: string, cname: string) => {
  const name = cname + "=";
  const ca = cookies.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return;
};

export default instagramTask;
