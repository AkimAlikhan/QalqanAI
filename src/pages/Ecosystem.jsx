import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as d3 from 'd3';
import { Info, X } from 'lucide-react';
import { getCluster } from '../api/client';
import './Ecosystem.css';

const nodeColors = {
    website: '#00f0ff',
    domain: '#a855f7',
    tracker: '#ff8c42',
    certificate: '#2ed573',
    wallet: '#ffd700',
    contact: '#ff6b81',
};

const nodeTypeLabels = {
    website: 'Website',
    domain: 'IP / Domain',
    tracker: 'Tracker ID',
    certificate: 'TLS Certificate',
    wallet: 'Crypto Wallet',
    contact: 'Contact / Operator',
};

export default function Ecosystem() {
    const svgRef = useRef(null);
    const containerRef = useRef(null);
    const [selectedNode, setSelectedNode] = useState(null);
    const [graphData, setGraphData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchParams] = useSearchParams();
    const urlParam = searchParams.get('url');

    // Fetch graph data from API
    useEffect(() => {
        setLoading(true);
        getCluster(urlParam || '')
            .then((data) => {
                setGraphData(data);
                setLoading(false);
            })
            .catch(() => {
                setGraphData({ nodes: [], edges: [] });
                setLoading(false);
            });
    }, [urlParam]);

    // Render D3 graph
    useEffect(() => {
        if (!graphData || !svgRef.current || !containerRef.current) return;
        if (graphData.nodes.length === 0) return;

        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Clear previous
        d3.select(svgRef.current).selectAll('*').remove();

        const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height);

        const g = svg.append('g');

        // Zoom
        const zoom = d3.zoom()
            .scaleExtent([0.2, 4])
            .on('zoom', (event) => { g.attr('transform', event.transform); });
        svg.call(zoom);

        // Build D3-friendly data (clone to avoid mutation issues)
        const nodes = graphData.nodes.map(n => ({ ...n }));
        const edges = graphData.edges
            .map(e => ({
                source: e.source,
                target: e.target,
                label: e.label,
            }))
            .filter(e => nodes.some(n => n.id === e.source) && nodes.some(n => n.id === e.target));

        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(edges).id(d => d.id).distance(140))
            .force('charge', d3.forceManyBody().strength(-400))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(35));

        // Edges
        const link = g.append('g').selectAll('line')
            .data(edges)
            .join('line')
            .attr('stroke', '#ffffff15')
            .attr('stroke-width', 1.5);

        // Edge labels
        const linkLabel = g.append('g').selectAll('text')
            .data(edges)
            .join('text')
            .text(d => d.label)
            .attr('font-size', 9)
            .attr('fill', '#ffffff50')
            .attr('text-anchor', 'middle');

        // Nodes
        const node = g.append('g').selectAll('g')
            .data(nodes)
            .join('g')
            .call(d3.drag()
                .on('start', (event, d) => { if (!event.active) simulation.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
                .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
                .on('end', (event, d) => { if (!event.active) simulation.alphaTarget(0); d.fx = null; d.fy = null; })
            )
            .on('click', (event, d) => {
                event.stopPropagation();
                setSelectedNode(d);
            });

        // Node circles
        node.append('circle')
            .attr('r', d => d.type === 'website' ? 20 : 14)
            .attr('fill', d => `${nodeColors[d.type] || '#888'}20`)
            .attr('stroke', d => nodeColors[d.type] || '#888')
            .attr('stroke-width', 2);

        // Inner dot
        node.append('circle')
            .attr('r', d => d.type === 'website' ? 6 : 4)
            .attr('fill', d => nodeColors[d.type] || '#888');

        // Labels
        node.append('text')
            .text(d => d.label.length > 20 ? d.label.slice(0, 17) + '...' : d.label)
            .attr('dy', d => (d.type === 'website' ? 32 : 24))
            .attr('text-anchor', 'middle')
            .attr('font-size', 10)
            .attr('fill', '#ffffffcc')
            .attr('font-family', 'monospace');

        simulation.on('tick', () => {
            link.attr('x1', d => d.source.x).attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x).attr('y2', d => d.target.y);
            linkLabel.attr('x', d => (d.source.x + d.target.x) / 2)
                .attr('y', d => (d.source.y + d.target.y) / 2);
            node.attr('transform', d => `translate(${d.x},${d.y})`);
        });

        svg.on('click', () => setSelectedNode(null));

        return () => simulation.stop();
    }, [graphData]);

    if (loading) {
        return (
            <div className="ecosystem page-container">
                <h1 className="page-title">Ecosystem Graph</h1>
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Loading ecosystem data...</p>
                </div>
            </div>
        );
    }

    const websiteCount = graphData?.nodes?.filter(n => n.type === 'website').length || 0;
    const totalNodes = graphData?.total_nodes || graphData?.nodes?.length || 0;
    const totalEdges = graphData?.total_edges || graphData?.edges?.length || 0;

    return (
        <div className="ecosystem page-container">
            <div className="eco-header animate-in">
                <div>
                    <h1 className="page-title">Ecosystem Graph</h1>
                    <p className="page-subtitle">
                        Interactive visualization of infrastructure clusters and shared markers
                        {urlParam && <span style={{ color: 'var(--accent-cyan)' }}> — filtered by {urlParam}</span>}
                    </p>
                </div>
            </div>

            <div className="graph-container animate-in animate-in-delay-1" ref={containerRef}>
                <svg ref={svgRef}></svg>

                {/* Cluster Summary */}
                <div className="cluster-summary glass-card">
                    <h4 className="summary-label">CLUSTER SUMMARY</h4>
                    <div className="summary-stat"><strong>{websiteCount}</strong> Websites</div>
                    <div className="summary-stat"><strong>{totalNodes}</strong> Total Nodes</div>
                    <div className="summary-stat"><strong>{totalEdges}</strong> Connections</div>
                    {graphData?.cluster_id && (
                        <div className="summary-stat cluster-id"><strong>{graphData.cluster_id}</strong> Cluster ID</div>
                    )}
                </div>

                {/* Legend */}
                <div className="graph-legend glass-card">
                    <h4 className="legend-title">NODE TYPES</h4>
                    {Object.entries(nodeTypeLabels).map(([type, label]) => (
                        <div key={type} className="legend-item">
                            <span className="legend-dot" style={{ background: nodeColors[type] }}></span>
                            {label}
                        </div>
                    ))}
                </div>

                {/* Node Detail Panel */}
                {selectedNode && (
                    <div className="node-detail glass-card">
                        <div className="detail-header">
                            <div className="detail-type" style={{ color: nodeColors[selectedNode.type] }}>
                                <Info size={14} /> {nodeTypeLabels[selectedNode.type]}
                            </div>
                            <button className="detail-close" onClick={() => setSelectedNode(null)}>
                                <X size={14} />
                            </button>
                        </div>
                        <h3 className="detail-label">{selectedNode.label}</h3>
                        {selectedNode.risk > 0 && (
                            <div className="detail-risk">
                                Risk Score: <strong style={{ color: selectedNode.risk >= 80 ? 'var(--danger)' : selectedNode.risk >= 50 ? 'var(--warning)' : 'var(--success)' }}>
                                    {selectedNode.risk}
                                </strong>
                            </div>
                        )}
                        {selectedNode.metadata?.category && (
                            <div className="detail-meta">Category: {selectedNode.metadata.category}</div>
                        )}
                        {selectedNode.metadata?.issuer && (
                            <div className="detail-meta">Issuer: {selectedNode.metadata.issuer}</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
