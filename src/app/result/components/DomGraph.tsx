'use client'

import { DomNode } from "@/app/types";
import { useEffect, useRef, useState } from "react";
import * as d3 from 'd3';

declare module 'd3' {
  interface HierarchyPointNode<Datum> {
    x0?: number;
    y0?: number;
    _children?: HierarchyPointNode<Datum>[] | undefined;
  }
}

type DomGraphProps = {
  data: DomNode;
};

export default function DomGraph({ data }: DomGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const rootRef = useRef<d3.HierarchyPointNode<DomNode> | null>(null);

  const [svgWidth, setSvgWidth] = useState(1000);
  const [svgHeight, setSvgHeight] = useState(1000);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const treeLayout = d3.tree<DomNode>().nodeSize([80, 30]);
    const root = d3.hierarchy(data) as d3.HierarchyPointNode<DomNode>;
    rootRef.current = root;

    collapseChildren(root);
    treeLayout(root);
    adjustNodePositions(root);

    updateSvgSize();
    renderTree(root);
  }, [data]);

  /**
   * 루트 노드의 직계 자식까지만 보이도록 설정하는 함수  
   * (하위 노드는 `_children`으로 저장하고 기본적으로 접힘)
   */
  const collapseChildren = (root: d3.HierarchyPointNode<DomNode>) => {
    root.children?.forEach((child) => {
      child._children = child.children;
      child.children = undefined;
    });
  };

  /**
   * 노드의 깊이를 기준으로 Y 좌표를 설정하는 함수  
   * (노드 간 Y 간격을 180으로 설정)
   */
  const adjustNodePositions = (root: d3.HierarchyPointNode<DomNode>) => {
    root.descendants().forEach((d) => {
      d.y = d.depth * 180;
    });
  };

  /**
   * 트리의 최대 깊이 및 X 좌표를 계산하여 SVG 크기를 동적으로 조정하는 함수  
   */
  const updateSvgSize = () => {
    if (!rootRef.current) return;

    const maxDepth = d3.max(rootRef.current.descendants(), (d) => d.depth) || 0;
    setSvgHeight((maxDepth + 1) * 180 + 200);

    const maxX = d3.max(rootRef.current.descendants(), (d) => d.x) || 1000;
    setSvgWidth(Math.max(maxX, 1200));
  };

  /**
   * 트리 구조를 SVG에 렌더링하는 함수  
   * - 기존 SVG 내용을 초기화  
   * - SVG 그룹 요소를 생성하고 초기 위치를 설정  
   * - 줌(zoom) 기능 적용  
   * - `update` 함수를 호출하여 트리 업데이트  
   */
  const renderTree = (root: d3.HierarchyPointNode<DomNode>) => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const initialX = svgWidth / 2;
    const initialY = 50;
    const g = svg.append('g').attr('transform', `translate(${initialX}, ${initialY})`);
    gRef.current = g.node()!;

    applyZoom(svg, g);
    update(root, g);
  };

  /**
   * 줌(zoom) 기능을 적용하는 함수  
   * - 마우스 스크롤로 확대/축소 가능  
   * - 드래그를 통해 트리 이동 가능  
   */
  const applyZoom = (
    svg: d3.Selection<SVGSVGElement, unknown, null, undefined>,
    g: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(svgWidth / 2, 50).scale(1));
  };

  /**
   * 트리를 업데이트하는 함수  
   * - 트리 레이아웃을 다시 계산하여 노드 위치 조정  
   * - 노드와 링크를 업데이트하여 화면에 반영  
   */
  const update = (source: d3.HierarchyPointNode<DomNode>, g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    if (!rootRef.current) return;

    const treeLayout = d3.tree<DomNode>().nodeSize([80, 30]);
    treeLayout(rootRef.current);
    adjustNodePositions(rootRef.current);
    updateSvgSize();

    const nodes = rootRef.current.descendants();
    const links = rootRef.current.links();

    const nodeSelection = g.selectAll<SVGGElement, d3.HierarchyPointNode<DomNode>>('g.node');
    const linkSelection = g.selectAll<SVGPathElement, d3.HierarchyPointLink<DomNode>>('path.link');

    updateNodes(source, g, nodes, nodeSelection);
    updateLinks(source, g, links, linkSelection);
  };

  /**
   * 노드를 업데이트하는 함수  
   * - 노드를 클릭하면 접고 펼치는 기능 추가  
   * - 새 노드가 추가될 경우 애니메이션 적용  
   */
  const updateNodes = (
    source: d3.HierarchyPointNode<DomNode>,
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    nodes: d3.HierarchyPointNode<DomNode>[],
    nodeSelection: d3.Selection<SVGGElement, d3.HierarchyPointNode<DomNode>, SVGGElement, unknown>
  ) => {
    const node = nodeSelection.data(nodes, (d) => d.data.id);
    const nodeEnter = node.enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.x0 ?? source.x},${source.y0 ?? source.y})`)
      .on('click', (_, d) => {
        d.children = d.children ? undefined : d._children;
        update(d, g);
      });

    nodeEnter.append('rect')
      .attr('width', 80)
      .attr('height', 30)
      .attr('x', -40)
      .attr('y', -15)
      .style('fill', '#32CD32')
      .style('stroke', '#000')
      .style('stroke-width', 2)
      .style('rx', 5);

    nodeEnter.append('text')
      .attr('dy', '.35em')
      .attr('x', 0)
      .attr('y', 0)
      .attr('text-anchor', 'middle')
      .text((d) => d.data.tag)
      .style('fill', '#1E90FF')
      .style('font-weight', 'bold');

    nodeEnter.merge(node)
      .transition().duration(500)
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node.exit()
      .transition().duration(500)
      .attr('transform', () => `translate(${source.x},${source.y})`)
      .remove();
  };

  return (
    <div>
      <h1>DOM Tree Visualizer</h1>
      <svg ref={svgRef} width={svgWidth} height={svgHeight} />
    </div>
  );
}
