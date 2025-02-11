'use client'

import { DomNode } from "@/app/types";
import { useEffect, useRef } from "react";
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
  const rootRef = useRef<d3.HierarchyPointNode<DomNode>>(null);

  useEffect(() => {
    if (!svgRef.current || !data) return;

    const treeLayout = d3.tree<DomNode>().nodeSize([80, 30]);

    const root = d3.hierarchy(data) as d3.HierarchyPointNode<DomNode>;
    rootRef.current = root;

    root.children?.forEach((child) => {
      child._children = child.children;
      child.children = undefined;
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', 'translate(100,50)');
    rootRef.current = root;
    treeLayout(root);

    update(root, g);
  }, [data]);

  const update = (
    source: d3.HierarchyPointNode<DomNode>,
    g: d3.Selection<SVGGElement, unknown, null, undefined>
  ) => {
    if (!rootRef.current) return;

    const nodes = rootRef.current.descendants();
    const links = rootRef.current.links();

    nodes.forEach((d) => (d.y = d.depth * 180));

    const nodeSelection = g.selectAll<SVGGElement, d3.HierarchyPointNode<DomNode>>('g.node');
    const linkSelection = g.selectAll<SVGPathElement, d3.HierarchyPointLink<DomNode>>('path.link');

    const node = nodeSelection.data(nodes, (d) => d.data.id);

    const nodeEnter = node
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.x0 ?? source.x},${source.y0 ?? source.y})`)
      .on('click', (_, d) => {
        if (d.children) {
          d._children = d.children;
          d.children = undefined;
        } else {
          d.children = d._children;
          d._children = undefined;
        }
        update(d, g);
      });

    nodeEnter
      .append('circle')
      .attr('r', 10)
      .style('fill', (d) => (d._children ? 'lightsteelblue' : '#32CD32'))
      .style('stroke', '#000')
      .style('stroke-width', 2);

    nodeEnter
      .append('text')
      .attr('dy', '.35em')
      .attr('x', (d) => (d.children || d._children ? -13 : 13))
      .attr('text-anchor', (d) => (d.children || d._children ? 'end' : 'start'))
      .text((d) => d.data.tag)
      .style('fill', '#1E90FF')
      .style('font-weight', 'bold');

    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate
      .transition()
      .duration(500)
      .attr('transform', (d) => `translate(${d.x},${d.y})`);

    node.exit()
      .transition()
      .duration(500)
      .attr('transform', () => `translate(${source.x},${source.y})`)
      .remove();

    const link = linkSelection.data(links, (d) => d.target.data.id);

    const linkEnter = link
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', (d) => {
        const o = { x: source.x0 ?? source.x, y: source.y0 ?? source.y };
        return diagonal(o, o);
      })
      .style('fill', 'none')
      .style('stroke', '#1E90FF')
      .style('stroke-width', 2);

    linkEnter.merge(link)
      .transition()
      .duration(500)
      .attr('d', (d) => diagonal(d.source, d.target));

    link.exit()
      .transition()
      .duration(500)
      .attr('d', (d) => {
        const o = { x: source.x, y: source.y };
        return diagonal(o, o);
      })
      .remove();

    nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  };

  const diagonal = (s: { x: number; y: number }, d: { x: number; y: number }) => `
    M ${s.x} ${s.y}
    C ${(s.x + d.x) / 2} ${s.y},
      ${(s.x + d.x) / 2} ${d.y},
      ${d.x} ${d.y}
  `;

  return (
    <div>
      <h1>DOM Tree Visualizer</h1>
      <svg ref={svgRef} width={8000} height={6000} />
    </div>
  );
}