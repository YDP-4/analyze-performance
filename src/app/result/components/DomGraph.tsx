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

  const collapseChildren = (root: d3.HierarchyPointNode<DomNode>) => {
    root.children?.forEach((child) => {
      child._children = child.children;
      child.children = undefined;
    });
  };

  const adjustNodePositions = (root: d3.HierarchyPointNode<DomNode>) => {
    root.descendants().forEach((d) => {
      d.y = d.depth * 180;
    });
  };

  const updateSvgSize = () => {
    if (!rootRef.current) return;
    const maxDepth = d3.max(rootRef.current.descendants(), (d) => d.depth) || 0;
    setSvgHeight((maxDepth + 1) * 180 + 200);
    const maxX = d3.max(rootRef.current.descendants(), (d) => d.x) || 1000;
    setSvgWidth(Math.max(maxX, 1200));
  };

  const renderTree = (root: d3.HierarchyPointNode<DomNode>) => {
    const svg = d3.select(svgRef.current as SVGSVGElement);
    svg.selectAll('*').remove();

    const initialX = svgWidth / 2;
    const initialY = 50;
    const g = svg.append('g').attr('transform', `translate(${initialX}, ${initialY})`);
    gRef.current = g.node()!;


    applyZoom(svg, g);
    update(root, g);
  };

  const applyZoom = (svg: d3.Selection<SVGSVGElement, unknown, null, undefined>, g: d3.Selection<SVGGElement, unknown, null, undefined>) => {
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform.toString());
      });

    svg.call(zoom);
    svg.call(zoom.transform, d3.zoomIdentity.translate(svgWidth / 2, 50).scale(1));
  };

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

  const updateLinks = (
    source: d3.HierarchyPointNode<DomNode>,
    g: d3.Selection<SVGGElement, unknown, null, undefined>,
    links: d3.HierarchyPointLink<DomNode>[],
    linkSelection: d3.Selection<SVGPathElement, d3.HierarchyPointLink<DomNode>, SVGGElement, unknown>
  ) => {
    const link = linkSelection.data(links, (d) => d.target.data.id);
    const linkEnter = link.enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d) => diagonal(source, source))
      .style('fill', 'none')
      .style('stroke', '#1E90FF')
      .style('stroke-width', 2);

    linkEnter.merge(link)
      .transition().duration(500)
      .attr('d', (d) => diagonal(d.source, d.target));

    link.exit()
      .transition().duration(500)
      .attr('d', (d) => diagonal(source, source))
      .remove();
  };

  const diagonal = (s: { x: number; y: number }, d: { x: number; y: number }) => `
    M ${s.x} ${s.y + 15}
    C ${(s.x + d.x) / 2} ${s.y + 15},
      ${(s.x + d.x) / 2} ${d.y - 15},
      ${d.x} ${d.y - 15}
  `;

  return (
    <div>
      <h1>DOM Tree Visualizer</h1>
      <svg ref={svgRef} width={svgWidth} height={svgHeight} />
    </div>
  );
}
