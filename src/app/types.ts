export interface AnalyzeResult {
  domGraph: DomNode;
  navigationTiming: NavigationTiming;
}

export type DomNode = {
  id: string;
  tag: string;
  children: DomNode[];
};


export interface NavigationTiming {
  type: string;
  startTime: number;
  duration: number;
  redirectCount: number;
  redirectStart: number;
  redirectEnd: number;
  domainLookupStart: number;
  domainLookupEnd: number;
  connectStart: number;
  connectEnd: number;
  secureConnectionStart: number;
  requestStart: number;
  responseStart: number;
  responseEnd: number;
  domInteractive: number;
  domContentLoadedEventStart: number;
  domContentLoadedEventEnd: number;
  loadEventStart: number;
  loadEventEnd: number;
}
