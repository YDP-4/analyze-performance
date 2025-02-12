"use server";

import { NavigationTiming } from "@/app/types";
import { Browser } from "puppeteer";

export async function getNavigationTiming(browser: Browser, url: string): Promise<NavigationTiming> {
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: "load" });

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
