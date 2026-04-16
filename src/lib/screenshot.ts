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

    // Font injection now lives in /render/smart-drop/page.tsx as a <style> tag,
    // so Chromium picks it up during normal page parsing (no timing races).

    await page.goto(url, { waitUntil: "networkidle0", timeout: 20000 });

    // Wait for the card element to appear
    await page.waitForSelector(selector, { timeout: 15000 });

    // Wait for fonts to actually load into the FontFaceSet and be ready to paint.
    // Without this, networkidle0 can fire before Noto Color Emoji is usable,
    // leaving tofu boxes where emoji should be.
    await page.evaluate(() => (document as unknown as { fonts: { ready: Promise<unknown> } }).fonts.ready);

    // Wait for all avatar <img> elements to finish loading (not covered by fonts.ready).
    await page.evaluate(async () => {
      const imgs = Array.from(document.images);
      await Promise.all(
        imgs.map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((res) => {
                img.onload = () => res();
                img.onerror = () => res();
              })
        )
      );
    });

    // Small buffer for final repaint after fonts swap (metrics shift → relayout).
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
