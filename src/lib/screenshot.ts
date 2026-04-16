import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";

/**
 * Take a screenshot of a page element using headless Chromium.
 * Works on Vercel serverless via @sparticuz/chromium.
 *
 * @param url - Full URL to navigate to
 * @param selector - CSS selector for the element to screenshot (default: "#card")
 * @param waitMs - Extra wait time after element appears (for images/avatars to load)
 */
export async function takeScreenshot(
  url: string,
  selector: string = "#card",
  waitMs: number = 1500
): Promise<Buffer> {
  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1200, height: 900 },
    executablePath: await chromium.executablePath(),
    headless: true,
  });

  try {
    const page = await browser.newPage();

    // Inject emoji font so headless Chromium can render emoji
    await page.evaluateOnNewDocument(() => {
      const style = document.createElement("style");
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Color+Emoji&display=swap');
        * { font-family: 'Inter', 'Noto Color Emoji', sans-serif !important; }
      `;
      document.head.appendChild(style);
    });

    await page.goto(url, { waitUntil: "networkidle0", timeout: 20000 });

    // Wait for the card element to appear
    await page.waitForSelector(selector, { timeout: 15000 });

    // Extra wait for avatars and images to load
    await new Promise((r) => setTimeout(r, waitMs));

    const element = await page.$(selector);
    if (!element) {
      throw new Error(`Element "${selector}" not found on page`);
    }

    const screenshot = await element.screenshot({ type: "png" });
    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}
