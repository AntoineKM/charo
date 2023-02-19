import puppeteer, { Browser, Page } from "puppeteer";
import Log from "../utils/log";

export default class BrowserController {
  private static prefix = "[browser]";

  public static async launch(): Promise<[Browser, Page]> {
    const browser = await puppeteer.launch({
      headless: true,
    });

    Log.info(this.prefix, "init browser");
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    return [browser, page];
  }
}
