"use server";

import { NavigationTiming } from "@/app/types";
import { Browser } from "puppeteer";

/**
 * 주어진 URL의 네비게이션 타이밍 데이터를 수집하여 반환
 * @param {Browser} browser - Puppeteer 브라우저 인스턴스
 * @param {string} url - 분석할 웹페이지의 URL
 * @returns {Promise<NavigationTiming>} - 네비게이션 타이밍 데이터
 */
export async function getNavigationTiming(browser: Browser, url: string): Promise<NavigationTiming> {
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "load" });

    /**
     * 브라우저 내부에서 실행되며, Performance API를 이용해 네비게이션 타이밍 데이터를 수집
     * @returns {NavigationTiming} - 수집된 네비게이션 타이밍 데이터
     */
    const navigationTiming = await page.evaluate(() => {
      const entries = performance.getEntriesByType("navigation");

      if (entries.length === 0 || !(entries[0] instanceof PerformanceNavigationTiming)) {
        throw new Error("Navigation timing data is unavailable or invalid.");
      }

      const navigationEntry = entries[0];
      return {
        type: navigationEntry.type,
        startTime: navigationEntry.startTime,
        duration: navigationEntry.duration,
        redirectCount: navigationEntry.redirectCount,
        redirectStart: navigationEntry.redirectStart,
        redirectEnd: navigationEntry.redirectEnd,
        domainLookupStart: navigationEntry.domainLookupStart,
        domainLookupEnd: navigationEntry.domainLookupEnd,
        connectStart: navigationEntry.connectStart,
        connectEnd: navigationEntry.connectEnd,
        secureConnectionStart: navigationEntry.secureConnectionStart,
        requestStart: navigationEntry.requestStart,
        responseStart: navigationEntry.responseStart,
        responseEnd: navigationEntry.responseEnd,
        domInteractive: navigationEntry.domInteractive,
        domContentLoadedEventStart: navigationEntry.domContentLoadedEventStart,
        domContentLoadedEventEnd: navigationEntry.domContentLoadedEventEnd,
        loadEventStart: navigationEntry.loadEventStart,
        loadEventEnd: navigationEntry.loadEventEnd,
      };
    });

    return navigationTiming;
  } finally {
    await page.close();
  }
}
