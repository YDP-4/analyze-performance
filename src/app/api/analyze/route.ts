import { NextRequest, NextResponse } from "next/server";
import { launch } from "puppeteer";
import { AnalyzeResult } from "@/app/types";
import { generateDomGraph } from "@/lib/analyze/generateDomGraph";
import { getNavigationTiming } from "@/lib/analyze/getNavigationTiming";
import { getPerformanceMetrics } from "@/lib/analyze/getPerformanceMetrics";


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const encodedUrl = searchParams.get("url");

  if (!encodedUrl) {
    return NextResponse.json(
      { error: "Missing required parameter: url" },
      { status: 400 }
    );
  }

  const decodedUrl = decodeURIComponent(encodedUrl);

  try {
    new URL(decodedUrl);
  } catch {
    return NextResponse.json({ error: "Invalid URL format" }, { status: 400 });
  }

  try {
    const results = await analyzeAll(decodedUrl);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Failed to analyze URL:", error);
    return NextResponse.json({ error: "Failed to analyze URL" }, { status: 500 });
  }
}

async function analyzeAll(url: string) : Promise<AnalyzeResult> {
  const browser = await launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--user-data-dir=/tmp/puppeteer-profile"],
  });

  try {
    const domGraphPromise = generateDomGraph(browser, url);
    const navigationTimingPromise = getNavigationTiming(browser, url);
    const performanceMetricsPromise = getPerformanceMetrics(browser, url);


    const [domGraph, navigationTiming, performanceMetrics] = await Promise.all([
      domGraphPromise,
      navigationTimingPromise,
      performanceMetricsPromise
    ]);

    return {
      domGraph,
      navigationTiming,
      performanceMetrics
    };
  } finally {
    await browser.close();
  }
}