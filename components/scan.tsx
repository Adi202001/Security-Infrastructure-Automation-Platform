'use client';

import React, { useState } from 'react';
import { Shield, AlertTriangle, Info, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";

export function NewScanDialog({ trigger }) {
  const [scanType, setScanType] = useState('vulnerability');
  const [target, setTarget] = useState('');
  const [scanOptions, setScanOptions] = useState({
    includeZap: true,
    includeNuclei: true,
    scanIntensity: 'standard',
    portRange: '1-1000',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!target) {
      setFormError('Target URL or IP address is required');
      return;
    }
    
    setIsSubmitting(true);
    setFormError('');
    
    try {
      // This would be a real API call in a production app
      console.log('Starting scan with options:', {
        scanType,
        target,
        options: scanOptions
      });
      
      // Simulate API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock success response
      alert(`Scan initiated for ${target}`);
      setTarget('');
      setOpen(false); // Close dialog on success
      
    } catch (error) {
      setFormError('Failed to start scan. Please try again.');
      console.error('Scan error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button>New Scan</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] md:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">New Security Scan</DialogTitle>
        </DialogHeader>
        
        <div className="my-2">
          <p className="text-gray-600 dark:text-gray-400">Configure and launch a new security scan against a target</p>
        </div>
        
        {formError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <AlertDescription>{formError}</AlertDescription>
          </Alert>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6 pr-1">
          {/* Target Input */}
          <div>
            <label htmlFor="target" className="block text-sm font-medium mb-1">
              Target URL or IP Address
            </label>
            <Input
              id="target"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              placeholder="e.g., example.com or 192.168.1.1"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Specify a domain, subdomain, or IP address to scan
            </p>
          </div>
          
          {/* Scan Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Scan Type
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ScanTypeCard
                title="Reconnaissance"
                description="Map out network, find subdomains, services, and open ports"
                icon={<Search size={20} className="mr-2 text-indigo-600 dark:text-indigo-400" />}
                selected={scanType === 'reconnaissance'}
                onClick={() => setScanType('reconnaissance')}
              />
              
              <ScanTypeCard
                title="Vulnerability"
                description="Scan for security vulnerabilities and weaknesses"
                icon={<Shield size={20} className="mr-2 text-indigo-600 dark:text-indigo-400" />}
                selected={scanType === 'vulnerability'}
                onClick={() => setScanType('vulnerability')}
              />
              
              <ScanTypeCard
                title="Comprehensive"
                description="Full security assessment including recon and vulnerability testing"
                icon={<Shield size={20} className="mr-2 text-indigo-600 dark:text-indigo-400" />}
                selected={scanType === 'comprehensive'}
                onClick={() => setScanType('comprehensive')}
              />
            </div>
          </div>
          
          {/* Advanced Options */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium">
                Advanced Options
              </label>
              <span className="text-sm text-gray-500 dark:text-gray-400">Optional</span>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4 border border-gray-200 dark:border-gray-700">
              {/* Scanner Options */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Scanners</h3>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="zap-scanner"
                      checked={scanOptions.includeZap}
                      onCheckedChange={(checked) => 
                        setScanOptions({...scanOptions, includeZap: checked})
                      }
                    />
                    <label 
                      htmlFor="zap-scanner" 
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      OWASP ZAP Scanner
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="nuclei-scanner"
                      checked={scanOptions.includeNuclei}
                      onCheckedChange={(checked) => 
                        setScanOptions({...scanOptions, includeNuclei: checked})
                      }
                    />
                    <label 
                      htmlFor="nuclei-scanner" 
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Nuclei Scanner
                    </label>
                  </div>
                </div>
              </div>
              
              {/* Scan Intensity */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Scan Intensity</h3>
                <Select
                  value={scanOptions.scanIntensity}
                  onValueChange={(value) => 
                    setScanOptions({...scanOptions, scanIntensity: value})
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select scan intensity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick (Minimal Impact)</SelectItem>
                    <SelectItem value="standard">Standard (Balanced)</SelectItem>
                    <SelectItem value="thorough">Thorough (Comprehensive)</SelectItem>
                    <SelectItem value="aggressive">Aggressive (High Impact)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Port Range */}
              <div>
                <h3 className="text-sm font-medium mb-2">Port Range</h3>
                <Input
                  value={scanOptions.portRange}
                  onChange={(e) => 
                    setScanOptions({...scanOptions, portRange: e.target.value})
                  }
                  placeholder="e.g., 1-1000 or 22,80,443"
                />
              </div>
            </div>
          </div>
          
          {/* Information Notice */}
          <Alert className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-400" />
            <AlertDescription>
              Only scan systems you have permission to test. Unauthorized scanning may be illegal.
            </AlertDescription>
          </Alert>
          
          {/* Submit Button */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isSubmitting}
              className={isSubmitting ? "opacity-75 cursor-not-allowed" : ""}
            >
              {isSubmitting ? 'Starting Scan...' : 'Start Scan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for scan type selection cards
function ScanTypeCard({ title, description, icon, selected, onClick }) {
  return (
    <Card
      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
        selected ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </Card>
  );
}