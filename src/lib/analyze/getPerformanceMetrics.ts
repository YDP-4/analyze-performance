"use server";

import { PerformanceMetrics } from "@/app/types";
import { Browser } from "puppeteer";

export async function getPerformanceMetrics(browser: Browser, url: string): Promise<PerformanceMetrics> {
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();

    try {
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: "networkidle2" });

        const nodeCount = await page.evaluate(() => document.querySelectorAll("*").length);

        await client.send("Performance.enable");

        await new Promise((resolve) => setTimeout(resolve, 5000));

        const performanceMetrics = await client.send("Performance.getMetrics");

        const metricsMap: Record<string, number> = {};
        for (const metric of performanceMetrics.metrics) {
            metricsMap[metric.name] = metric.value;
        }
        
        return {
            fmp: (metricsMap["FirstMeaningfulPaint"] - metricsMap["NavigationStart"]) * 1000 || 0,
            dcl: (metricsMap["DomContentLoaded"] - metricsMap["NavigationStart"]) * 1000 || 0,
            layoutCount: metricsMap["LayoutCount"] || 0,
            recalcStyleCount: metricsMap["RecalcStyleCount"] || 0,
            scriptExecutionTime: metricsMap["ScriptDuration"] * 1000 || 0,
            resourceCount: metricsMap["Resources"] || 0,
            jsHeapUsedSize: metricsMap["JSHeapUsedSize"] / metricsMap["JSHeapTotalSize"] || 0,
        };
    } finally {
        await page.close();
    }
}
