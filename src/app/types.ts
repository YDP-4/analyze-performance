export interface AnalyzeResult {
  domGraph: DomNode;
}

export type DomNode = {
    id: string;
    tag: string;
    children: DomNode[];
  };