import {
  Browser,
  ContinueRequestOverrides,
  HTTPRequest,
  Page,
} from "puppeteer";
import { InstagramUser } from "../types/instagram";
import getCookie from "../utils/getCookie";
import Log from "../utils/log";
import BrowserController from "./browser";

export default class InstagramController {
  private static prefix = "[instagram]";
  private static routes = {
    base: "https://instagram.com",
    api: {
      user_profile_info:
        "https://www.instagram.com/api/v1/users/web_profile_info",
    },
  };

  public static connect = async (token: string): Promise<[Browser, Page]> => {
    const cookies = [
      {
        name: "sessionid",
        value: token,
        domain: ".instagram.com",
      },
    ];

    let headers: {
      [key: string]: string;
    } = {};

    const interceptor = async (request: HTTPRequest) => {
      if (request.method() === "POST") {
        if (request.headers().cookie)
          headers = { ...headers, ...request.headers() };
      }

      if (request.url().includes(this.routes.api.user_profile_info)) {
        const data = {
          method: "GET",
          referrerPolicy: "strict-origin-when-cross-origin",
          headers: {
            "x-csrftoken": getCookie(headers?.cookie, "csrftoken"),
            "x-ig-app-id": headers["x-ig-app-id"],
          },
        } as ContinueRequestOverrides;
        return data;
      }

      return;
    };

    const [browser, page] = await BrowserController.launch(interceptor);

    await page.goto(this.routes.base);
    if (process.env.NODE_ENV !== "production") {
      // accept cookies
      Log.info(this.prefix, "accepting cookies...");
      await page.waitForSelector("div[role='dialog']", { timeout: 1000 });
      await page.click("div[role='dialog'] button[tabindex='0']");
    } else {
      Log.info(this.prefix, "skipping cookies popup");
    }
    // set cookies
    Log.info(this.prefix, "set cookies");
    await page.setCookie(...cookies);

    // reload page
    Log.info(this.prefix, "reload page");
    await page.reload();

    return [browser, page];
  };

  public static async me(token: string): Promise<InstagramUser> {
    const [browser, page] = await this.connect(token);
    const user = await page.evaluate(() => {
      const scripts = Array.from(
        document.querySelectorAll("script[type='application/json']")
      );
      if (!scripts) throw new Error("user not found");
      const scheduledServerJS = scripts.find((script) => {
        const parsedScript = JSON.parse(script.textContent || "");
        if (parsedScript.require?.[0]?.[0] === "ScheduledServerJS") {
          return true;
        }
        return false;
      });
      if (!scheduledServerJS) throw new Error("user not found");
      const parsedscheduledServerJS = JSON.parse(
        scheduledServerJS.textContent || ""
      );

      const XIGSharedData =
        parsedscheduledServerJS.require?.[0]?.[3]?.[0]?.__bbox.define.find(
          (a) => a?.[0] === "XIGSharedData"
        );
      const XIGSharedDataContent = XIGSharedData?.[2];
      const parsedXIGSharedDataContentRaw = JSON.parse(
        XIGSharedDataContent?.raw || ""
      );
      const user = parsedXIGSharedDataContentRaw?.config.viewer;
      return user;
    });
    Log.info(this.prefix, "connected as", user.username);

    // TODO: Add the user to the database

    await browser.close();

    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      profile_pic_url: user.profile_pic_url,
    };
  }

  public static async getUser(token: string, username: string) {
    const [, page] = await this.connect(token);
    const response = await page.goto(
      `${this.routes.api.user_profile_info}?username=${username}`
    );
    if (!response) throw new Error("user not found");
    const responseBody = await response?.json();
    const user = responseBody?.data.user;
    if (!user) throw new Error("user not found");
    return {
      id: user.id,
      username: user.username,
      full_name: user.full_name,
      profile_pic_url: user.profile_pic_url,
    };
  }
}
