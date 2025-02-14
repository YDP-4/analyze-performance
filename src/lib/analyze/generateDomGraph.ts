"use server"; // Next.js 서버 환경에서 실행

import { DomNode } from "@/app/types";
import { Browser } from "puppeteer";

/**
 * 주어진 URL의 DOM 구조를 트리 형태로 분석하여 반환
 * @param {Browser} browser - Puppeteer 브라우저 인스턴스
 * @param {string} url - 분석할 웹페이지의 URL
 * @returns {Promise<DomNode>} - DOM 트리 구조 객체
 */
export async function generateDomGraph(browser: Browser, url: string): Promise<DomNode> {
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "load" });

    /**
     * 브라우저 내부에서 실행되며, 현재 페이지의 DOM을 재귀적으로 탐색하여 트리 형태로 변환
     * @returns {DomNode} - DOM 트리 구조 객체
     */
    const domGraph: DomNode = await page.evaluate(() => {
      function buildGraph(node: HTMLElement, path = "0"): DomNode {
        return {
          id: path,
          tag: node.tagName.toLowerCase(),
          children: Array.from(node.children).map((child, index) =>
            buildGraph(child as HTMLElement, `${path}-${index}`)
          ),
        };
      }

      return buildGraph(document.documentElement as HTMLElement);
    });

    return domGraph;
  } finally {
    await page.close();
  }
}
