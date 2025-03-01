'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle, Shield, Search, Server, Activity, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import Link from 'next/link';
import { NewScanDialog } from '@/components/scan';

export default function DashboardPage() {
  // Sample data for the dashboard
  const vulnerabilityData = [
    { name: 'High', count: 12, fill: '#e53e3e' },
    { name: 'Medium', count: 23, fill: '#ed8936' },
    { name: 'Low', count: 38, fill: '#48bb78' },
  ];

  const recentScans = [
    { id: 1, target: 'example.com', timestamp: '2025-02-26 09:15', status: 'Completed', findings: 8 },
    { id: 2, target: 'testphp.vulnweb.com', timestamp: '2025-02-25 14:22', status: 'Completed', findings: 17 },
    { id: 3, target: 'scanme.nmap.org', timestamp: '2025-02-24 11:30', status: 'Completed', findings: 4 },
  ];

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header with breadcrumb */}
        <header className="flex h-16 shrink-0 items-center gap-2 bg-white dark:bg-gray-900 shadow-sm z-10">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">Security Platform</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="ml-auto mr-4">
            <NewScanDialog 
              trigger={
                <Button variant="default" size="sm">
                  New Scan
                </Button>
              }/>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-2 bg-gray-100 dark:bg-gray-950">
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Security Dashboard</h2>
          
          {/* Dashboard Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard 
              title="Total Scans" 
              value="24" 
              icon={<Search className="text-blue-500" size={24} />} 
              bgColor="bg-blue-100" 
            />
            
            <MetricCard 
              title="Vulnerabilities" 
              value="73" 
              icon={<AlertCircle className="text-red-500" size={24} />} 
              bgColor="bg-red-100" 
            />
            
            <MetricCard 
              title="Hosts Scanned" 
              value="12" 
              icon={<Server className="text-green-500" size={24} />} 
              bgColor="bg-green-100" 
            />
            
            <MetricCard 
              title="Subdomains" 
              value="128" 
              icon={<Activity className="text-purple-500" size={24} />} 
              bgColor="bg-purple-100" 
            />
          </div>
          
          {/* Charts & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Vulnerability Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Vulnerability Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={vulnerabilityData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Scans */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Scans</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Target</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Findings</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentScans.map(scan => (
                        <TableRow key={scan.id}>
                          <TableCell className="font-medium text-blue-600 dark:text-blue-400">{scan.target}</TableCell>
                          <TableCell>{scan.timestamp}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {scan.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{scan.findings}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Vulnerability Summary */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Vulnerability Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>Recent</TableHead>
                      <TableHead>Fixed</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                          High
                        </Badge>
                      </TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>3</TableCell>
                      <TableCell>2</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">
                          Medium
                        </Badge>
                      </TableCell>
                      <TableCell>23</TableCell>
                      <TableCell>5</TableCell>
                      <TableCell>8</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          Low
                        </Badge>
                      </TableCell>
                      <TableCell>38</TableCell>
                      <TableCell>12</TableCell>
                      <TableCell>15</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

function MetricCard({ title, value, icon, bgColor }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-2">{title}</h3>
        <div className="flex items-center">
          <div className={`${bgColor} dark:bg-opacity-20 p-3 rounded-full mr-4`}>
            {icon}
          </div>
          <span className="text-2xl font-bold dark:text-white">{value}</span>
        </div>
      </CardContent>
    </Card>
  );
}