"use server";

import { PerformanceMetrics } from "@/app/types";
import { Browser } from "puppeteer";

/**
 * 주어진 URL의 성능 메트릭을 측정하여 반환
 * @param {Browser} browser - Puppeteer 브라우저 인스턴스
 * @param {string} url - 성능을 측정할 웹페이지의 URL
 * @returns {Promise<PerformanceMetrics>} - 성능 메트릭 데이터
 */
export async function getPerformanceMetrics(browser: Browser, url: string): Promise<PerformanceMetrics> {
    const page = await browser.newPage();
    const client = await page.target().createCDPSession();

    try {
        await page.setViewport({ width: 1280, height: 800 });
        await page.goto(url, { waitUntil: "networkidle2" });

        /**
         * DOM 내 전체 노드 수를 계산하여 성능 지표로 활용
         */
        const nodeCount = await page.evaluate(() => document.querySelectorAll("*").length);

        /**
         * Chrome DevTools Protocol(CDP)을 이용하여 성능 데이터 수집 활성화
         */
        await client.send("Performance.enable");

        // 안정적인 성능 측정을 위해 5초 대기
        await new Promise((resolve) => setTimeout(resolve, 5000));

        /**
         * CDP를 통해 브라우저의 성능 메트릭 데이터 가져오기
         */
        const performanceMetrics = await client.send("Performance.getMetrics");

        const metricsMap: Record<string, number> = {};
        for (const metric of performanceMetrics.metrics) {
            metricsMap[metric.name] = metric.value;
        }

        /**
         * 수집된 성능 데이터를 가공하여 반환
         */
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
