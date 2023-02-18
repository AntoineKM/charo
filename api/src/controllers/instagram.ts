import Log from "../utils/log";
import BrowserController from "./browser";

export default class InstagramController {
  private static prefix = "[instagram]";
  private static routes = {
    base: "https://instagram.com",
  };

  public static async signIn(token: string) {
    const cookies = [
      {
        name: "sessionid",
        value: token,
        domain: ".instagram.com",
      },
    ];

    const page = await BrowserController.launch();
    await page.goto(this.routes.base);

    // accept cookies
    Log.info(this.prefix, "accepting cookies...");
    await page.waitForSelector("div[role='dialog']");
    await page.click("div[role='dialog'] button[tabindex='0']");
    // set cookies
    Log.info(this.prefix, "set cookies", { ...cookies, value: "**********" });
    await page.setCookie(...cookies);

    // reload page
    Log.info(this.prefix, "reload page");
    await page.reload();

    try {
      return {
        username: "anonymous",
      };
    } catch (error) {
      Log.error(this.prefix, error);
      return {
        error: error.message,
      };
    }
  }
}
