import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { ConceptGraphData, ConceptNode, ConceptLink } from '../types';

interface ConceptGraphProps {
  data: ConceptGraphData;
  onNodeClick?: (nodeId: string) => void;
}

const ConceptGraph: React.FC<ConceptGraphProps> = ({ data, onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height: 400 }); // Fixed height for now
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const width = dimensions.width;
    const height = dimensions.height;

    // Create a deep copy of data because d3.force mutates it
    const nodes = data.nodes.map(d => ({ ...d })) as (ConceptNode & d3.SimulationNodeDatum)[];
    const links = data.links.map(d => ({ ...d })) as (ConceptLink & d3.SimulationLinkDatum<d3.SimulationNodeDatum>)[];

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    const link = svg.append("g")
      .attr("stroke", "#94a3b8")
      .attr("stroke-opacity", 0.6)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke-width", d => Math.sqrt(d.value || 1));

    const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", d => d.group === 1 ? 20 : (d.group === 2 ? 15 : 10))
      .attr("fill", d => d.group === 1 ? "#3b82f6" : (d.group === 2 ? "#10b981" : "#8b5cf6"))
      .attr("cursor", "pointer")
      .call((d3.drag() as any)
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.on("click", (event, d) => {
        if (onNodeClick) onNodeClick(d.id);
    });

    node.append("title")
      .text(d => d.description);

    const labels = svg.append("g")
      .selectAll("text")
      .data(nodes)
      .join("text")
      .attr("dx", 12)
      .attr("dy", ".35em")
      .text(d => d.id)
      .style("font-size", "12px")
      .style("fill", "#334155")
      .style("pointer-events", "none");

    simulation.on("tick", () => {
      link
        .attr("x1", d => (d.source as any).x)
        .attr("y1", d => (d.source as any).y)
        .attr("x2", d => (d.target as any).x)
        .attr("y2", d => (d.target as any).y);

      node
        .attr("cx", d => d.x!)
        .attr("cy", d => d.y!);

      labels
        .attr("x", d => d.x!)
        .attr("y", d => d.y!);
    });

    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return () => {
      simulation.stop();
    };
  }, [data, dimensions, onNodeClick]);

  return (
    <div ref={containerRef} className="w-full bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div className="p-3 bg-slate-100 border-b border-slate-200 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-700">Concept Map</h3>
        <span className="text-xs text-slate-500">Interactive • Drag nodes</span>
      </div>
      <svg 
        ref={svgRef} 
        width={dimensions.width} 
        height={dimensions.height} 
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        className="w-full"
      />
    </div>
  );
};

export default ConceptGraph;