import Log from "../utils/log";
import BrowserController from "./browser";

export default class InstagramController {
  private static prefix = "[instagram]";
  private static routes = {
    base: "https://instagram.com",
  };

  public static async me(token: string) {
    const cookies = [
      {
        name: "sessionid",
        value: token,
        domain: ".instagram.com",
      },
    ];

    const [browser, page] = await BrowserController.launch();
    await page.goto(this.routes.base);

    // accept cookies
    Log.info(this.prefix, "accepting cookies...");
    await page.waitForSelector("div[role='dialog']");
    await page.click("div[role='dialog'] button[tabindex='0']");
    // set cookies
    Log.info(this.prefix, "set cookies");
    await page.setCookie(...cookies);

    // reload page
    Log.info(this.prefix, "reload page");
    await page.reload();

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
    try {
      return {
        username: user.username,
        profilePicture: user.profile_pic_url,
      };
    } catch (error) {
      Log.error(this.prefix, error);
      return {
        error: error.message,
      };
    }
  }
}
