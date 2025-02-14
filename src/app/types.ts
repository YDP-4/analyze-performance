export type AnalyzeResult = {
  domGraph: DomNode;
  navigationTiming: NavigationTiming;
  performanceMetrics: PerformanceMetrics;
}

export type DomNode = {
  id: string;
  tag: string;
  children: DomNode[];
};


export type NavigationTiming = {
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

export type PerformanceMetrics = {
  fmp: number;
  dcl: number;
  layoutCount: number;
  recalcStyleCount: number;
  scriptExecutionTime: number;
  resourceCount: number;
  jsHeapUsedSize: number;
}

export type TimingDataSubset = Pick<
  NavigationTiming,
  | 'domainLookupStart'
  | 'domainLookupEnd'
  | 'connectStart'
  | 'connectEnd'
  | 'requestStart'
  | 'responseStart'
  | 'responseEnd'
  | 'domInteractive'
  | 'domContentLoadedEventEnd'
  | 'loadEventEnd'
>;

export type EventData = {
  label: string;
  start: number;
  end: number;
}


