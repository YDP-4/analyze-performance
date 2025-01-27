import { DomNode } from "@/app/types";
import { Browser } from "puppeteer";

export async function generateDomGraph(browser: Browser, url: string): Promise<DomNode> {
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "load" });

    const domGraph: DomNode = await page.evaluate(() => {
      function buildGraph(node: HTMLElement, path = "0"): DomNode {
        const children = Array.from(node.children).map((child, index) =>
          buildGraph(child as HTMLElement, `${path}-${index}`)
        );
        return {
          id: path,
          tag: node.tagName.toLowerCase(),
          children,
        };
      }

      return buildGraph(document.documentElement as HTMLElement);
    });

    return domGraph;
  } finally {
    await page.close();
  }
}
