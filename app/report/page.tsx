'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FileText, Download, Eye, Calendar, Filter, AlertTriangle, Shield, Search, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

// Define types
interface ReportSummary {
  total_subdomains: number;
  open_ports_count: number;
  total_ports_scanned: number;
  total_vulnerabilities: number;
}

interface Report {
  id: string;
  title: string;
  creation_date: string;
  target: string;
  report_type: 'basic' | 'detailed' | 'executive';
  summary: ReportSummary;
}

interface Filters {
  type: string;
  target: string;
  dateRange: string;
}

// Mock API service (replace with your actual API service)
const apiService = {
  reporting: {
    getReports: async (filters: Filters): Promise<Report[]> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      return [
        {
          id: '1',
          title: 'Security Assessment Report - example.com',
          creation_date: '2025-02-25T10:30:00',
          target: 'example.com',
          report_type: 'detailed',
          summary: {
            total_subdomains: 12,
            open_ports_count: 8,
            total_ports_scanned: 1000,
            total_vulnerabilities: 6
          }
        },
        {
          id: '2',
          title: 'Executive Security Summary - testphp.vulnweb.com',
          creation_date: '2025-02-23T14:15:00',
          target: 'testphp.vulnweb.com',
          report_type: 'executive',
          summary: {
            total_subdomains: 5,
            open_ports_count: 12,
            total_ports_scanned: 1000,
            total_vulnerabilities: 14
          }
        },
        {
          id: '3',
          title: 'Basic Security Scan - scanme.nmap.org',
          creation_date: '2025-02-20T09:45:00',
          target: 'scanme.nmap.org',
          report_type: 'basic',
          summary: {
            total_subdomains: 3,
            open_ports_count: 5,
            total_ports_scanned: 100,
            total_vulnerabilities: 2
          }
        }
      ];
    },
    getReportDetails: async (reportId: string): Promise<Report> => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock data - this would be fetched based on the reportId
      return {
        id: reportId,
        title: 'Security Assessment Report - example.com',
        creation_date: '2025-02-25T10:30:00',
        target: 'example.com',
        report_type: 'detailed',
        summary: {
          total_subdomains: 12,
          open_ports_count: 8,
          total_ports_scanned: 1000,
          total_vulnerabilities: 6
        }
      };
    },
    downloadReport: async (reportId: string) => {
      // Simulate API call for download
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // This would normally return a blob or file
      return {
        data: new Blob(['Mock PDF report content'], { type: 'application/pdf' })
      };
    }
  }
};

export default function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reportId = searchParams.get('reportId');
  
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    type: 'all-types',
    target: '',
    dateRange: 'all',
  });

  // Fetch reports from API
  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const response = await apiService.reporting.getReports(filters);
        setReports(response);
        setLoading(false);
      } catch (err: any) {
        setError('Failed to fetch reports: ' + err.message);
        setLoading(false);
      }
    };

    fetchReports();
  }, [filters.type, filters.dateRange]); // Re-fetch when these filters change

  // Filter reports by target (client-side filtering)
  const filteredReports = reports.filter(report => {
    // Filter by report type
    if (filters.type !== 'all-types' && report.report_type !== filters.type) {
      return false;
    }
    
    // Filter by target (client-side because it's a text search)
    if (filters.target && !report.target.toLowerCase().includes(filters.target.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Load specific report if reportId is provided in the URL
  useEffect(() => {
    if (reportId) {
      const fetchReportDetails = async () => {
        try {
          const reportDetails = await apiService.reporting.getReportDetails(reportId);
          setSelectedReport(reportDetails);
          setShowReportDialog(true);
        } catch (err: any) {
          setError('Failed to fetch report details: ' + err.message);
        }
      };
      
      fetchReportDetails();
    }
  }, [reportId]);

  // View report details
  const handleViewReport = (report: Report) => {
    setSelectedReport(report);
    setShowReportDialog(true);
    router.push(`/reports?reportId=${report.id}`, { scroll: false });
  };

  // Close report dialog
  const handleCloseReportDialog = () => {
    setShowReportDialog(false);
    setSelectedReport(null);
    router.push('/reports', { scroll: false });
  };

  // Download report
  const handleDownloadReport = async (reportId: string) => {
    try {
      const response = await apiService.reporting.downloadReport(reportId);
      
      // Create a download link for the blob
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report-${reportId}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading report:', error);
      alert('Failed to download report. Please try again.');
    }
  };

  // Generate new report
  const handleGenerateReport = () => {
    router.push('/reports/new');
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Get report type badge
  const getReportTypeBadge = (type: string) => {
    switch (type) {
      case 'detailed':
        return (
          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
            Detailed
          </Badge>
        );
      case 'executive':
        return (
          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300">
            Executive
          </Badge>
        );
      case 'basic':
      default:
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            Basic
          </Badge>
        );
    }
  };

  // Get vulnerability count severity class
  const getVulnerabilityCountClass = (count: number): string => {
    if (count > 10) return 'text-red-600 dark:text-red-400 font-bold';
    if (count > 5) return 'text-orange-600 dark:text-orange-400 font-bold';
    return 'text-green-600 dark:text-green-400 font-bold';
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading reports: {error}
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <>
        {/* Filters & Actions */}
        <Card className="mb-6 shadow-md border-t-4 border-indigo-400 dark:border-indigo-600">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div>
                  <label htmlFor="type-filter" className="block text-sm font-medium mb-1">
                    Report Type
                  </label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters({ ...filters, type: value })}
                  >
                    <SelectTrigger id="type-filter" className="w-full">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-types">All Types</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                      <SelectItem value="executive">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label htmlFor="target-filter" className="block text-sm font-medium mb-1">
                    Target
                  </label>
                  <Input
                    id="target-filter"
                    value={filters.target}
                    onChange={(e) => setFilters({ ...filters, target: e.target.value })}
                    placeholder="Filter by target..."
                  />
                </div>
                
                <div>
                  <label htmlFor="date-filter" className="block text-sm font-medium mb-1">
                    Date Range
                  </label>
                  <Select
                    value={filters.dateRange}
                    onValueChange={(value) => setFilters({ ...filters, dateRange: value })}
                  >
                    <SelectTrigger id="date-filter" className="w-full">
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={handleGenerateReport}
                  className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                >
                  Generate New Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Reports List */}
        <Card className="shadow-md overflow-hidden">
          <div className="divide-y divide-border">
            {filteredReports.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <div className="mx-auto my-6 w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <p className="mt-2 text-lg font-medium">No reports match your filters</p>
                <p className="mt-1">Try adjusting your search or filter criteria</p>
              </div>
            ) : (
              filteredReports.map(report => (
                <div key={report.id} className="p-4 hover:bg-muted/20 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-2 md:mb-0">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-400 mr-2" />
                        <p className="text-lg font-medium text-indigo-600 dark:text-indigo-400 truncate">{report.title}</p>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground flex flex-wrap items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{formatDate(report.creation_date)}</span>
                        <span className="mx-2">&bull;</span>
                        <span>Target: {report.target}</span>
                        <span className="mx-2">&bull;</span>
                        {getReportTypeBadge(report.report_type)}
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-2 md:mt-0">
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all mr-2"
                        onClick={() => handleViewReport(report)}
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="text-green-700 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-950 transition-all"
                        onClick={() => handleDownloadReport(report.id)}
                      >
                        <Download size={16} className="mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  {/* Report Summary */}
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex flex-col p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-muted-foreground">Subdomains</span>
                      <span className="text-foreground font-medium">{report.summary.total_subdomains}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-muted-foreground">Open Ports</span>
                      <span className="text-foreground font-medium">{report.summary.open_ports_count}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-muted-foreground">Ports Scanned</span>
                      <span className="text-foreground font-medium">{report.summary.total_ports_scanned}</span>
                    </div>
                    <div className="flex flex-col p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="text-muted-foreground">Vulnerabilities</span>
                      <span className={getVulnerabilityCountClass(report.summary.total_vulnerabilities)}>
                        {report.summary.total_vulnerabilities}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
        
        {/* Report Detail Dialog */}
        <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedReport?.title}</DialogTitle>
            </DialogHeader>
            
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Generated on {selectedReport && formatDate(selectedReport.creation_date)} for {selectedReport?.target}
              </p>
              <div className="mt-2">
                {selectedReport && getReportTypeBadge(selectedReport.report_type)}
              </div>
            </div>
            
            {selectedReport && (
              <div className="mb-4">
                <h4 className="text-md font-medium mb-2">Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-muted-foreground">Subdomains</span>
                    <span className="text-foreground font-bold text-lg">{selectedReport.summary.total_subdomains}</span>
                  </div>
                  <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-muted-foreground">Open Ports</span>
                    <span className="text-foreground font-bold text-lg">{selectedReport.summary.open_ports_count}</span>
                  </div>
                  <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-muted-foreground">Ports Scanned</span>
                    <span className="text-foreground font-bold text-lg">{selectedReport.summary.total_ports_scanned}</span>
                  </div>
                  <div className="flex flex-col p-3 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="text-muted-foreground">Vulnerabilities</span>
                    <span className={`font-bold text-lg ${getVulnerabilityCountClass(selectedReport.summary.total_vulnerabilities)}`}>
                      {selectedReport.summary.total_vulnerabilities}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded mb-4">
              <p className="text-sm text-muted-foreground">
                This is a preview of the report. Download the full report to see complete details including vulnerability details, 
                recommendations, and detailed scan results.
              </p>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={handleCloseReportDialog}
              >
                Close
              </Button>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-600"
                onClick={() => selectedReport && handleDownloadReport(selectedReport.id)}
              >
                <Download size={16} className="mr-1" />
                Download Full Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <PageHeader title="Security Reports" />
        
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