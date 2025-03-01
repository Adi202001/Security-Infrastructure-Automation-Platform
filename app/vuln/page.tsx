'use client';

import React, { useState, useEffect } from 'react';
// Define types for the vulnerability data
interface Vulnerability {
  id: number;
  name: string;
  target: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  type: string;
  description: string;
  evidence: string;
  discoveryDate: string;
  isFixed: boolean;
  source: 'zap' | 'nuclei' | 'internal' | string;
}
import { AlertCircle, ShieldOff, ArrowUpDown, Filter, ExternalLink, Check, X, Shield } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function VulnerabilityListPage() {
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    severity: 'all-severities',
    target: '',
    status: 'active', // 'active', 'fixed', 'all'
  });
  const [sortBy, setSortBy] = useState('severity'); // 'severity', 'date', 'target'
  const [sortDirection, setSortDirection] = useState('desc');

  // Fetch data - in a real app this would call your API
  useEffect(() => {
    // Simulating API call
    setLoading(true);
    setTimeout(() => {
      // Mock data
      const mockVulnerabilities: Vulnerability[] = [
        {
          id: 1,
          name: 'SQL Injection Vulnerability',
          target: 'example.com',
          severity: 'HIGH',
          type: 'sqli',
          description: 'SQL injection vulnerability in login form allows attackers to bypass authentication',
          evidence: 'Parameter id=1 OR 1=1 returns sensitive data',
          discoveryDate: '2025-02-20T10:15:22',
          isFixed: false,
          source: 'zap'
        },
        {
          id: 2,
          name: 'Cross-Site Scripting (XSS)',
          target: 'example.com',
          severity: 'MEDIUM',
          type: 'xss',
          description: 'Reflected XSS vulnerability in search functionality',
          evidence: 'Parameter q=<script>alert(1)</script> executes JavaScript',
          discoveryDate: '2025-02-22T14:28:15',
          isFixed: false,
          source: 'nuclei'
        },
        {
          id: 3,
          name: 'Outdated OpenSSH Version',
          target: 'scanme.nmap.org',
          severity: 'MEDIUM',
          type: 'outdated',
          description: 'Server is running an outdated version of OpenSSH that contains known vulnerabilities',
          evidence: 'OpenSSH 6.6.1p1 detected',
          discoveryDate: '2025-02-24T09:45:10',
          isFixed: false,
          source: 'internal'
        },
        {
          id: 4,
          name: 'Insecure SSL/TLS Configuration',
          target: 'testphp.vulnweb.com',
          severity: 'HIGH',
          type: 'ssl',
          description: 'Server supports weak SSL/TLS protocols and cipher suites',
          evidence: 'TLSv1.0 and weak ciphers detected',
          discoveryDate: '2025-02-21T11:32:40',
          isFixed: true,
          source: 'zap'
        },
        {
          id: 5,
          name: 'Missing HTTP Security Headers',
          target: 'example.com',
          severity: 'LOW',
          type: 'headers',
          description: 'Missing security headers including X-Frame-Options and Content-Security-Policy',
          evidence: 'HTTP response does not include recommended security headers',
          discoveryDate: '2025-02-25T16:12:05',
          isFixed: false,
          source: 'nuclei'
        },
        {
          id: 6,
          name: 'Directory Listing Enabled',
          target: 'testphp.vulnweb.com',
          severity: 'LOW',
          type: 'directory',
          description: 'Server directory listing is enabled which may expose sensitive files',
          evidence: 'Directory listing available at /images/',
          discoveryDate: '2025-02-23T08:54:30',
          isFixed: false,
          source: 'internal'
        },
        {
          id: 7,
          name: 'RCE Vulnerability in PHPInfo',
          target: 'testphp.vulnweb.com',
          severity: 'CRITICAL',
          type: 'rce',
          description: 'Remote code execution vulnerability in phpinfo.php page',
          evidence: 'Successful exploitation allows arbitrary code execution',
          discoveryDate: '2025-02-19T13:05:45',
          isFixed: false,
          source: 'nuclei'
        }
      ];
      
      setVulnerabilities(mockVulnerabilities);
      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort vulnerabilities
  const filteredVulnerabilities = vulnerabilities
    .filter(vuln => {
      // Apply severity filter
      if (filters.severity !== 'all-severities' && vuln.severity !== filters.severity) return false;
      
      // Apply target filter
      if (filters.target && !vuln.target.includes(filters.target)) return false;
      
      // Apply status filter
      if (filters.status === 'active' && vuln.isFixed) return false;
      if (filters.status === 'fixed' && !vuln.isFixed) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'severity') {
        const severityOrder: Record<string, number> = { 'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3, 'INFO': 4 };
        const result = severityOrder[a.severity] - severityOrder[b.severity];
        return sortDirection === 'asc' ? result : -result;
      } else       if (sortBy === 'date') {
        const dateA = new Date(a.discoveryDate).getTime();
        const dateB = new Date(b.discoveryDate).getTime();
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
      } else if (sortBy === 'target') {
        return sortDirection === 'asc' 
          ? a.target.localeCompare(b.target)
          : b.target.localeCompare(a.target);
      }
      return 0;
    });

  // Toggle sort direction or change sort field
  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('desc'); // Default to descending when changing fields
    }
  };

  // Mark vulnerability as fixed
  const handleMarkFixed = (id: number) => {
    setVulnerabilities(
      vulnerabilities.map(vuln => 
        vuln.id === id ? { ...vuln, isFixed: true } : vuln
      )
    );
  };

  // Get severity badge styling
  const getSeverityVariant = (severity: string): string => {
    switch (severity) {
      case 'CRITICAL':
        return 'destructive';
      case 'HIGH':
        return 'destructive';
      case 'MEDIUM':
        return 'yellow';
      case 'LOW':
        return 'green';
      default:
        return 'secondary';
    }
  };

  // Get severity color classes
  const getSeverityColorClasses = (severity: string): string => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-300 dark:border-red-800';
      case 'MEDIUM':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300 border-orange-300 dark:border-orange-800';
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-800';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800';
    }
  };

  // Get source badge styling
  const getSourceVariant = (source: string): string => {
    switch (source) {
      case 'zap':
        return 'outline';
      case 'nuclei':
        return 'outline';
      case 'internal':
        return 'outline';
      default:
        return 'outline';
    }
  };

  // Get source color classes
  const getSourceColorClasses = (source: string): string => {
    switch (source) {
      case 'zap':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800';
      case 'nuclei':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'internal':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-700';
    }
  };

  // Loading state with skeletons
  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <PageHeader title="Vulnerabilities" />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Card>
              <CardContent className="p-6">
                {Array(5).fill(0).map((_, index) => (
                  <div key={index} className="mb-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex mb-2">
                          <Skeleton className="h-5 w-16 rounded-full mr-2" />
                          <Skeleton className="h-5 w-16 rounded-full" />
                        </div>
                        <Skeleton className="h-6 w-64 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <Skeleton className="h-9 w-24 rounded-md" />
                    </div>
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-4 w-full mb-3" />
                    <Skeleton className="h-16 w-full rounded-md mb-3" />
                    {index < 4 && <Separator className="my-6" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Error state
  if (error) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <PageHeader title="Vulnerabilities" />
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Error loading vulnerabilities: {error}
              </AlertDescription>
            </Alert>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageHeader title="Vulnerabilities" />
        
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
          {/* Filters */}
          <Card className="shadow-md border-t-4 border-indigo-400 dark:border-indigo-600">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <label htmlFor="target-filter" className="text-sm font-medium">
                    Target
                  </label>
                  <Input
                    id="target-filter"
                    value={filters.target}
                    onChange={(e) => setFilters({ ...filters, target: e.target.value })}
                    placeholder="Filter by target..."
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="severity-filter" className="text-sm font-medium">
                    Severity
                  </label>
                  <Select
                    value={filters.severity}
                    onValueChange={(value) => setFilters({ ...filters, severity: value })}
                  >
                    <SelectTrigger id="severity-filter">
                      <SelectValue placeholder="All Severities" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-severities">All Severities</SelectItem>
                      <SelectItem value="CRITICAL">Critical</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="LOW">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="status-filter" className="text-sm font-medium">
                    Status
                  </label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="all">All</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline"
                    onClick={() => setFilters({ severity: '', target: '', status: 'active' })}
                  >
                    Reset Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Vulnerabilities List */}
          <Card className="shadow-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950 dark:to-blue-950">
              <div className="text-sm text-muted-foreground">
                Showing <span className="font-medium">{filteredVulnerabilities.length}</span> vulnerabilities
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant={sortBy === 'severity' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleSort('severity')}
                  className="text-xs"
                >
                  Severity {sortBy === 'severity' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button 
                  variant={sortBy === 'date' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleSort('date')}
                  className="text-xs"
                >
                  Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button 
                  variant={sortBy === 'target' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleSort('target')}
                  className="text-xs"
                >
                  Target {sortBy === 'target' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </div>
            </div>
            
            <div className="divide-y divide-border">
              {filteredVulnerabilities.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <div className="mx-auto my-6 w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <Filter className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="mt-2 text-lg font-medium">No vulnerabilities match your filters</p>
                  <p className="mt-1">Try adjusting your search or filter criteria</p>
                </div>
              ) : (
                filteredVulnerabilities.map(vuln => (
                  <div key={vuln.id} className="p-4 hover:bg-muted/20 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between">
                      <div className="mb-3 md:mb-0">
                        <div className="flex items-center flex-wrap gap-2">
                          <Badge className={getSeverityColorClasses(vuln.severity)}>
                            {vuln.severity}
                          </Badge>
                          <Badge className={getSourceColorClasses(vuln.source)}>
                            {vuln.source}
                          </Badge>
                          {vuln.isFixed && (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-800">
                              <Check size={12} className="mr-1" />
                              Fixed
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-lg font-medium mt-2 text-gray-900 dark:text-gray-100">
                          {vuln.name}
                        </h3>
                        <div className="text-sm text-muted-foreground mt-1">
                          <span className="text-blue-600 dark:text-blue-400 font-semibold">{vuln.target}</span> · 
                          <span className="text-gray-500 dark:text-gray-400"> Discovered: </span>
                          <span className="font-medium">{new Date(vuln.discoveryDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all"
                          onClick={() => alert(`View details for ${vuln.name}`)}
                        >
                          View Details
                        </Button>
                        {!vuln.isFixed && (
                          <Button 
                            variant="outline"
                            size="sm"
                            className="text-green-700 dark:text-green-500 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 transition-all"
                            onClick={() => handleMarkFixed(vuln.id)}
                          >
                            Mark as Fixed
                          </Button>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground">{vuln.description}</p>
                      <div className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 p-3 rounded border border-gray-200 dark:border-gray-700 font-mono">
                        <p className="font-medium text-indigo-700 dark:text-indigo-400 mb-1">Evidence:</p>
                        <p className="text-gray-800 dark:text-gray-300">{vuln.evidence}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
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