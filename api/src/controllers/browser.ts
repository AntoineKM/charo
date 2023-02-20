import puppeteer, {
  Browser,
  ContinueRequestOverrides,
  HTTPRequest,
  Page,
} from "puppeteer";
import Log from "../utils/log";

export default class BrowserController {
  private static prefix = "[browser]";

  public static async launch(
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    interceptor?: (
      request: HTTPRequest
    ) => Promise<ContinueRequestOverrides | undefined>
  ): Promise<[Browser, Page]> {
    const browser = await puppeteer.launch({
      headless: process.env.NODE_ENV === "production",
      args: ["--no-sandbox"],
    });

    Log.info(this.prefix, "init browser");
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    );

    Log.info(this.prefix, "setup request interceptor");
    await page.setRequestInterception(true);
    await page.on("request", async (request) => {
      if (interceptor) {
        const data = await interceptor(request);
        if (data) {
          request.continue(data);
          return;
        }
      }
      request.continue();
    });

    return [browser, page];
  }
}
