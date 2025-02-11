'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { EventData, TimingDataSubset } from '@/app/types';

export interface LoadingGraphProps {
  timingData: TimingDataSubset;
}

export default function PageLoadGraph({ timingData }: LoadingGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !timingData) return;

    const events: EventData[] = [
      {
        label: 'DNS Lookup',
        start: timingData.domainLookupStart,
        end: timingData.domainLookupEnd,
      },
      {
        label: 'TCP Connect',
        start: timingData.connectStart,
        end: timingData.connectEnd,
      },
      {
        label: 'Request',
        start: timingData.connectEnd,
        end: timingData.requestStart,
      },
      {
        label: 'Response',
        start: timingData.requestStart,
        end: timingData.responseEnd,
      },
      {
        label: 'DOM Interactive',
        start: timingData.responseEnd,
        end: timingData.domInteractive,
      },
      {
        label: 'DOM Content Loaded',
        start: timingData.domInteractive,
        end: timingData.domContentLoadedEventEnd,
      },
      {
        label: 'Page Load',
        start: timingData.domContentLoadedEventEnd,
        end: timingData.loadEventEnd,
      },
    ];

    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 50, left: 150 };

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(events, (d) => d.end) || 0])
      .range([0, chartWidth]);

    const yScale = d3
      .scaleBand()
      .domain(events.map((d) => d.label))
      .range([0, chartHeight])
      .padding(0.3);

    const chart = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    chart
      .append('g')
      .attr('transform', `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(xScale).ticks(10).tickFormat((d) => `${d} ms`));

    chart.append('g').call(d3.axisLeft(yScale));

    chart
      .selectAll('rect')
      .data(events)
      .enter()
      .append('rect')
      .attr('x', (d) => xScale(d.start))
      .attr('y', (d) => yScale(d.label)!)
      .attr('width', (d) => xScale(d.end) - xScale(d.start))
      .attr('height', yScale.bandwidth())
      .attr('fill', 'steelblue');

    chart
      .selectAll('text')
      .data(events)
      .enter()
      .append('text')
      .attr('x', (d) => xScale(d.start) + 5)
      .attr('y', (d) => yScale(d.label)! + yScale.bandwidth() / 1.5)
      .text((d) => `${d.start.toFixed(1)} - ${d.end.toFixed(1)} ms`)
      .attr('fill', 'white')
      .attr('font-size', '12px');
  }, [timingData]);

  return (
    <svg
      ref={svgRef}
      width={800}
      height={400}
      style={{ border: '1px solid lightgray' }}
    ></svg>
  );
}
