'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Server, Globe, Database, Network, Wifi, Shield, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Define types for the network data
interface NetworkNode {
  id: number;
  name: string;
  type: 'host' | 'subdomain' | 'service' | 'gateway';
  ip_address?: string;
  port?: number;
}

interface NetworkLink {
  source: number;
  target: number;
  type: string;
}

interface NetworkData {
  nodes: NetworkNode[];
  links: NetworkLink[];
}

interface NodeConnection {
  node: NetworkNode;
  type: string;
  direction: 'incoming' | 'outgoing';
}

export default function NetworkTopologyPage() {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTarget, setSelectedTarget] = useState('example.com');
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  // Fetch network data - in a real app this would call your API
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    // Simulate API call with timeout
    setTimeout(() => {
      try {
        // Mock data based on the component in the repository
        const mockData: NetworkData = {
          nodes: [
            { id: 1, name: 'example.com', type: 'host', ip_address: '93.184.216.34' },
            { id: 2, name: 'www.example.com', type: 'subdomain', ip_address: '93.184.216.34' },
            { id: 3, name: 'api.example.com', type: 'subdomain', ip_address: '93.184.216.35' },
            { id: 4, name: 'db.example.com', type: 'subdomain', ip_address: '93.184.216.36' },
            { id: 5, name: 'http:80', type: 'service', port: 80 },
            { id: 6, name: 'https:443', type: 'service', port: 443 },
            { id: 7, name: 'ssh:22', type: 'service', port: 22 },
            { id: 8, name: 'mysql:3306', type: 'service', port: 3306 },
            { id: 9, name: 'gateway1', type: 'gateway', ip_address: '93.184.216.1' },
            { id: 10, name: 'gateway2', type: 'gateway', ip_address: '93.184.216.2' },
          ],
          links: [
            { source: 1, target: 2, type: 'direct' },
            { source: 1, target: 3, type: 'direct' },
            { source: 1, target: 4, type: 'direct' },
            { source: 2, target: 5, type: 'service' },
            { source: 2, target: 6, type: 'service' },
            { source: 3, target: 6, type: 'service' },
            { source: 4, target: 8, type: 'service' },
            { source: 3, target: 7, type: 'service' },
            { source: 1, target: 9, type: 'gateway' },
            { source: 9, target: 10, type: 'gateway' },
            { source: 10, target: 4, type: 'gateway' },
          ]
        };
        
        setNetworkData(mockData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch network data');
        setLoading(false);
      }
    }, 1000);
  }, [selectedTarget]);

  // Get node details by ID
  const getNodeById = (id: number): NetworkNode | undefined => {
    return networkData?.nodes.find(node => node.id === id);
  };

  // Get icon for node type
  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'host':
        return <Globe size={20} />;
      case 'subdomain':
        return <Server size={20} />;
      case 'service':
        return <Database size={20} />;
      case 'gateway':
        return <Network size={20} />;
      default:
        return <Server size={20} />;
    }
  };

  // Get the connections for a specific node
  const getNodeConnections = (nodeId: number): NodeConnection[] => {
    if (!networkData) return [];

    const connections: NodeConnection[] = [];
    
    // Find incoming connections
    networkData.links.forEach(link => {
      if (link.target === nodeId) {
        const sourceNode = getNodeById(link.source);
        if (sourceNode) {
          connections.push({
            node: sourceNode,
            type: link.type,
            direction: 'incoming'
          });
        }
      }
    });
    
    // Find outgoing connections
    networkData.links.forEach(link => {
      if (link.source === nodeId) {
        const targetNode = getNodeById(link.target);
        if (targetNode) {
          connections.push({
            node: targetNode,
            type: link.type,
            direction: 'outgoing'
          });
        }
      }
    });
    
    return connections;
  };

  // Handle node click
  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node);
  };

  // Get color classes for node type
  const getNodeColorClasses = (type: string): { bg: string, text: string } => {
    switch (type) {
      case 'host':
        return { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-300' };
      case 'subdomain':
        return { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-300' };
      case 'service':
        return { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-300' };
      case 'gateway':
        return { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-300' };
      default:
        return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300' };
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading network data: {error}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        {/* Target Selection */}
        <Card className="mb-6 shadow-md border-t-4 border-indigo-400 dark:border-indigo-600">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="target-select" className="block text-sm font-medium mb-1">
                  Target Domain
                </label>
                <Select 
                  value={selectedTarget}
                  onValueChange={setSelectedTarget}
                >
                  <SelectTrigger id="target-select">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="example.com">example.com</SelectItem>
                    <SelectItem value="scanme.nmap.org">scanme.nmap.org</SelectItem>
                    <SelectItem value="testphp.vulnweb.com">testphp.vulnweb.com</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
                Refresh Topology
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Network Graph */}
          <div className="lg:col-span-2">
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
                <CardTitle>Network Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-b-md p-4 h-96 overflow-hidden">
                  {/* This would normally be a proper graph visualization like D3 or vis.js */}
                  {/* For simplicity, we're just showing nodes as clickable elements */}
                  <div className="absolute top-0 left-0 w-full h-full">
                    {/* Host */}
                    <div 
                      className="absolute top-1/2 left-1/4 transform -translate-x-1/2 -translate-y-1/2"
                      onClick={() => networkData && handleNodeClick(networkData.nodes[0])}
                    >
                      <div className={`flex flex-col items-center cursor-pointer ${selectedNode?.id === 1 ? 'ring-2 ring-indigo-500' : ''}`}>
                        <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 p-3 rounded-full">
                          <Globe size={24} />
                        </div>
                        <span className="mt-1 text-xs font-medium">{networkData?.nodes[0].name}</span>
                      </div>
                    </div>
                    
                    {/* Subdomains */}
                    <div 
                      className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      onClick={() => networkData && handleNodeClick(networkData.nodes[1])}
                    >
                      <div className={`flex flex-col items-center cursor-pointer ${selectedNode?.id === 2 ? 'ring-2 ring-indigo-500' : ''}`}>
                        <div className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 p-3 rounded-full">
                          <Server size={24} />
                        </div>
                        <span className="mt-1 text-xs font-medium">{networkData?.nodes[1].name}</span>
                      </div>
                    </div>
                    
                    <div 
                      className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      onClick={() => networkData && handleNodeClick(networkData.nodes[2])}
                    >
                      <div className={`flex flex-col items-center cursor-pointer ${selectedNode?.id === 3 ? 'ring-2 ring-indigo-500' : ''}`}>
                        <div className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 p-3 rounded-full">
                          <Server size={24} />
                        </div>
                        <span className="mt-1 text-xs font-medium">{networkData?.nodes[2].name}</span>
                      </div>
                    </div>
                    
                    <div 
                      className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                      onClick={() => networkData && handleNodeClick(networkData.nodes[3])}
                    >
                      <div className={`flex flex-col items-center cursor-pointer ${selectedNode?.id === 4 ? 'ring-2 ring-indigo-500' : ''}`}>
                        <div className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 p-3 rounded-full">
                          <Server size={24} />
                        </div>
                        <span className="mt-1 text-xs font-medium">{networkData?.nodes[3].name}</span>
                      </div>
                    </div>
                    
                    {/* Services */}
                    <div 
                      className="absolute top-1/4 left-3/4 transform -translate-x-1/2 -translate-y-1/2"
                      onClick={() => networkData && handleNodeClick(networkData.nodes[4])}
                    >
                      <div className={`flex flex-col items-center cursor-pointer ${selectedNode?.id === 5 ? 'ring-2 ring-indigo-500' : ''}`}>
                        <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 p-3 rounded-full">
                          <Database size={24} />
                        </div>
                        <span className="mt-1 text-xs font-medium">{networkData?.nodes[4].name}</span>
                      </div>
                    </div>
                    
                    <div 
                      className="absolute top-1/3 left-3/4 transform -translate-x-1/2 -translate-y-1/2"
                      onClick={() => networkData && handleNodeClick(networkData.nodes[5])}
                    >
                      <div className={`flex flex-col items-center cursor-pointer ${selectedNode?.id === 6 ? 'ring-2 ring-indigo-500' : ''}`}>
                        <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 p-3 rounded-full">
                          <Database size={24} />
                        </div>
                        <span className="mt-1 text-xs font-medium">{networkData?.nodes[5].name}</span>
                      </div>
                    </div>
                    
                    {/* Note: Added more nodes would make this demo cluttered */}
                    {/* In a real implementation, you'd use a proper graph visualization library */}
                  </div>
                  
                  <div className="absolute bottom-2 right-2 bg-white dark:bg-gray-900 p-2 rounded shadow text-xs">
                    <div className="flex flex-col space-y-2">
                      <div className="flex items-center">
                        <div className="bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300 p-1 rounded-full mr-2">
                          <Globe size={14} />
                        </div>
                        <span>Host</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 p-1 rounded-full mr-2">
                          <Server size={14} />
                        </div>
                        <span>Subdomain</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 p-1 rounded-full mr-2">
                          <Database size={14} />
                        </div>
                        <span>Service</span>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 p-1 rounded-full mr-2">
                          <Network size={14} />
                        </div>
                        <span>Gateway</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Node Details */}
          <div className="lg:col-span-1">
            <Card className="shadow-md">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
                <CardTitle>{selectedNode ? 'Node Details' : 'Select a Node'}</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {!selectedNode ? (
                  <div className="text-center text-muted-foreground p-6">
                    <Server size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>Click on a node in the network map to view its details</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center mb-4">
                      <div className={`p-3 rounded-full mr-3 ${
                        getNodeColorClasses(selectedNode.type).bg
                      } ${
                        getNodeColorClasses(selectedNode.type).text
                      }`}>
                        {getNodeIcon(selectedNode.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{selectedNode.name}</h3>
                        <Badge variant="outline" className="mt-1 capitalize">
                          {selectedNode.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Details</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {selectedNode.ip_address && (
                            <>
                              <div className="text-muted-foreground">IP Address</div>
                              <div className="font-mono">{selectedNode.ip_address}</div>
                            </>
                          )}
                          {selectedNode.port && (
                            <>
                              <div className="text-muted-foreground">Port</div>
                              <div className="font-mono">{selectedNode.port}</div>
                            </>
                          )}
                          <div className="text-muted-foreground">Type</div>
                          <div className="capitalize">{selectedNode.type}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">Connections</h4>
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700">
                        {getNodeConnections(selectedNode.id).length > 0 ? (
                          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                            {getNodeConnections(selectedNode.id).map((connection, index) => (
                              <li key={index} className="py-2 first:pt-0 last:pb-0">
                                <div className="flex items-center">
                                  <div className={`p-2 rounded-full mr-2 ${
                                    getNodeColorClasses(connection.node.type).bg
                                  } ${
                                    getNodeColorClasses(connection.node.type).text
                                  }`}>
                                    {getNodeIcon(connection.node.type)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">{connection.node.name}</p>
                                    <Badge variant="outline" className="mt-1 text-xs">
                                      {connection.direction === 'incoming' ? 'Incoming' : 'Outgoing'} {connection.type}
                                    </Badge>
                                  </div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-muted-foreground text-sm">No connections found</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="outline"
                        className="w-full text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
                        onClick={() => alert(`Scan ${selectedNode.name} for vulnerabilities`)}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Scan for Vulnerabilities
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Network Stats */}
            {networkData && (
              <Card className="mt-6 shadow-md">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
                  <CardTitle>Network Statistics</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    <li className="py-2 flex justify-between">
                      <span className="text-muted-foreground">Total Nodes</span>
                      <span className="font-medium">{networkData.nodes.length}</span>
                    </li>
                    <li className="py-2 flex justify-between">
                      <span className="text-muted-foreground">Subdomains</span>
                      <span className="font-medium">{networkData.nodes.filter(n => n.type === 'subdomain').length}</span>
                    </li>
                    <li className="py-2 flex justify-between">
                      <span className="text-muted-foreground">Services</span>
                      <span className="font-medium">{networkData.nodes.filter(n => n.type === 'service').length}</span>
                    </li>
                    <li className="py-2 flex justify-between">
                      <span className="text-muted-foreground">Gateways</span>
                      <span className="font-medium">{networkData.nodes.filter(n => n.type === 'gateway').length}</span>
                    </li>
                    <li className="py-2 flex justify-between">
                      <span className="text-muted-foreground">Total Connections</span>
                      <span className="font-medium">{networkData.links.length}</span>
                    </li>
                  </ul>
                  
                  <div className="mt-4">
                    <Button 
                      className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                      onClick={() => alert('Exporting network map...')}
                    >
                      Export Network Map
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageHeader title="Network Topology" />
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

// Page header component with breadcrumb
function PageHeader({ title }: { title: string }) {
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 bg-white dark:bg-gray-900 border-b">
      <div className="flex items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="#" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors">Security Platform</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-semibold">{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto mr-4">
        <Button className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors">
          <Shield className="w-4 h-4 mr-2" /> New Scan
        </Button>
      </div>
    </header>
  );
}