import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { v4 as uuidv4 } from 'uuid'; 
import { FileSpreadsheet, Upload, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrderData, OrderStatus } from '@/types';
import { toast } from 'sonner';

const SampleCSV = `Lineitem name,Billing Name,Billing Phone,Billing Address,Status
Electric Callus Remover for Feet,Khan Asim Iqbal,3457766748,"House no. 403-B, Peoples Colony-1",Not Responding
Electric Callus Remover for Feet,Amna Malik,3331925667,"House no. 123, Model Town",To Process
Portable Blender,Mohammad Ali,3214567890,"Apartment 7B, Johar Town",Not Responding
Hair Straightener,Fatima Ahmed,3109876543,"Shop 5, Anarkali Bazaar",To Process`;

const CSVUpload = () => {
  const { setOrders, orders } = useAppContext();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Column mapping state
  const [columnMap, setColumnMap] = useState({
    product: 0, // Default to first column (Lineitem name)
    name: 1,    // Default to second column (Billing Name)
    phone: 2,   // Default to third column (Billing Phone)
    address: 3, // Default to fourth column (Billing Address)
    status: 4,  // Default to fifth column (Status)
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    
    if (!selectedFile) {
      return;
    }
    
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please upload a valid CSV file');
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
    setFile(selectedFile);
    parseCSV(selectedFile);
  };

  const parseCSV = (file: File) => {
    setProcessing(true);
    setProgress(10);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        setProgress(50);
        const csvText = event.target?.result as string;
        const lines = csvText.split(/\r\n|\n/);
        
        // Extract headers and remove quotes if present
        const headers = lines[0].split(',').map(header => 
          header.replace(/^"(.*)"$/, '$1').trim()
        );
        
        setCsvHeaders(headers);
        
        // Try to auto-detect column mappings based on common header names
        const newColumnMap = { ...columnMap };
        
        headers.forEach((header, index) => {
          const headerLower = header.toLowerCase();
          
          if (headerLower.includes('item') || headerLower.includes('product') || headerLower.includes('lineitem')) {
            newColumnMap.product = index;
          }
          else if (headerLower.includes('name') && !headerLower.includes('item')) {
            newColumnMap.name = index;
          }
          else if (headerLower.includes('phone') || headerLower.includes('mobile') || headerLower.includes('contact')) {
            newColumnMap.phone = index;
          }
          else if (headerLower.includes('address')) {
            newColumnMap.address = index;
          }
          else if (headerLower.includes('status')) {
            newColumnMap.status = index;
          }
        });
        
        setColumnMap(newColumnMap);
        
        // Parse data rows (limited to 10 for preview)
        const dataRows = [];
        for (let i = 1; i < Math.min(lines.length, 11); i++) {
          if (lines[i].trim() !== '') {
            // Handle quoted fields correctly (simple CSV parsing)
            const row: string[] = [];
            let inQuote = false;
            let currentField = '';
            
            for (let j = 0; j < lines[i].length; j++) {
              const char = lines[i][j];
              
              if (char === '"' && (j === 0 || lines[i][j-1] !== '\\')) {
                inQuote = !inQuote;
              } else if (char === ',' && !inQuote) {
                row.push(currentField.replace(/^"(.*)"$/, '$1').trim());
                currentField = '';
              } else {
                currentField += char;
              }
            }
            
            // Add the last field
            row.push(currentField.replace(/^"(.*)"$/, '$1').trim());
            dataRows.push(row);
          }
        }
        
        setPreviewData(dataRows);
        setProgress(100);
        setProcessing(false);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        setError('Error parsing CSV file. Please check the format and try again.');
        setProcessing(false);
        setProgress(0);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setProcessing(false);
      setProgress(0);
    };
    
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }
    
    setProcessing(true);
    setProgress(10);
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const csvText = event.target?.result as string;
        const lines = csvText.split(/\r\n|\n/);
        
        setProgress(30);
        
        // Process all data rows
        const newOrders: OrderData[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim() === '') continue;
          
          // Parse the line considering quoted fields
          const row: string[] = [];
          let inQuote = false;
          let currentField = '';
          
          for (let j = 0; j < lines[i].length; j++) {
            const char = lines[i][j];
            
            if (char === '"' && (j === 0 || lines[i][j-1] !== '\\')) {
              inQuote = !inQuote;
            } else if (char === ',' && !inQuote) {
              row.push(currentField.replace(/^"(.*)"$/, '$1').trim());
              currentField = '';
            } else {
              currentField += char;
            }
          }
          
          // Add the last field
          row.push(currentField.replace(/^"(.*)"$/, '$1').trim());
          
          // Get values using column mapping
          const product = row[columnMap.product] || 'Unknown Product';
          const name = row[columnMap.name] || 'Unknown Customer';
          const phone = row[columnMap.phone] || '';
          const address = row[columnMap.address] || '';
          let status = row[columnMap.status] || 'To Process';
          
          // Validate and normalize the status
          if (!['Not Responding', 'To Process', 'Confirmed', 'Cancelled'].includes(status)) {
            if (status.toLowerCase().includes('not') && status.toLowerCase().includes('respond')) {
              status = 'Not Responding';
            } else if (status.toLowerCase().includes('process')) {
              status = 'To Process';
            } else if (status.toLowerCase().includes('confirm')) {
              status = 'Confirmed';
            } else if (status.toLowerCase().includes('cancel')) {
              status = 'Cancelled';
            } else {
              status = 'To Process'; // Default if unrecognized
            }
          }
          
          // Format phone number - remove non-numeric characters and ensure it's valid
          const formattedPhone = phone.replace(/\D/g, '');
          
          // Only add if we have a name and phone number
          if (name && formattedPhone) {
            newOrders.push({
              id: uuidv4(),
              product,
              name,
              phone: formattedPhone,
              address,
              status: status as OrderStatus,
              responseCount: 0
            });
          }
          
          setProgress(30 + Math.floor(60 * i / lines.length));
        }
        
        // Update orders in context
        setOrders(prevOrders => {
          // Check for duplicates based on name and phone
          const existingPhones = new Set(prevOrders.map(order => order.phone));
          const uniqueNewOrders = newOrders.filter(newOrder => !existingPhones.has(newOrder.phone));
          
          // Combine existing and new orders
          return [...prevOrders, ...uniqueNewOrders];
        });
        
        setProgress(100);
        setProcessing(false);
        
        toast.success(`Successfully imported ${newOrders.length} orders`);
        navigate('/messages');
      } catch (err) {
        console.error('Error importing CSV:', err);
        setError('Error importing CSV file. Please check the format and try again.');
        setProcessing(false);
        setProgress(0);
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file');
      setProcessing(false);
      setProgress(0);
    };
    
    reader.readAsText(file);
  };

  const downloadSampleCSV = () => {
    const blob = new Blob([SampleCSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample_orders.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetForm = () => {
    setFile(null);
    setPreviewData([]);
    setCsvHeaders([]);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">CSV Upload</h1>
        <p className="text-muted-foreground">
          Import your order data from a CSV file
        </p>
      </div>
      
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload CSV</TabsTrigger>
          <TabsTrigger value="format">CSV Format</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload Order Data</CardTitle>
              <CardDescription>
                Upload a CSV file containing customer order data to process in WhatsBot
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-file"
                />
                
                <div className="flex flex-col items-center justify-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <FileSpreadsheet className="h-8 w-8 text-primary" />
                  </div>
                  
                  <div>
                    <h3 className="font-medium">Drop your CSV file here or browse</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Support for CSV files with order data
                    </p>
                  </div>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={processing}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Select File
                  </Button>
                </div>
                
                {file && (
                  <div className="mt-4 flex items-center gap-2 p-2 border rounded bg-background">
                    <FileSpreadsheet className="h-4 w-4 text-primary" />
                    <span className="text-sm flex-1 truncate">{file.name}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={resetForm}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {processing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing file...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
              
              {previewData.length > 0 && !processing && (
                <div className="space-y-4">
                  <h3 className="font-medium">Preview</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse min-w-full">
                      <thead>
                        <tr className="bg-muted">
                          {csvHeaders.map((header, i) => (
                            <th key={i} className="px-3 py-2 text-sm font-medium text-left border">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, rowIndex) => (
                          <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted/50'}>
                            {row.map((cell, cellIndex) => (
                              <td key={cellIndex} className="px-3 py-2 text-sm border">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-4 bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm">Column Mapping</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      We've automatically detected the column mappings from your CSV. Please verify they are correct.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Product:</span>
                        <span className="text-sm font-medium">{csvHeaders[columnMap.product]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Name:</span>
                        <span className="text-sm font-medium">{csvHeaders[columnMap.name]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Phone:</span>
                        <span className="text-sm font-medium">{csvHeaders[columnMap.phone]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Address:</span>
                        <span className="text-sm font-medium">{csvHeaders[columnMap.address]}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">Status:</span>
                        <span className="text-sm font-medium">{csvHeaders[columnMap.status]}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between gap-2 flex-wrap">
              <Button 
                variant="outline" 
                onClick={downloadSampleCSV}
              >
                Download Sample CSV
              </Button>
              
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  onClick={resetForm}
                  disabled={!file || processing}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleImport}
                  disabled={!file || processing}
                >
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Import Data
                    </>
                  )}
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="format" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CSV Format Guidelines</CardTitle>
              <CardDescription>
                Follow these guidelines to ensure your CSV file is properly formatted
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Required Columns</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your CSV file should include the following columns:
                  </p>
                  
                  <div className="mt-2 space-y-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Product Name</p>
                        <p className="text-xs text-muted-foreground">The name of the product ordered (e.g., "Electric Callus Remover for Feet")</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Customer Name</p>
                        <p className="text-xs text-muted-foreground">The customer's full name (e.g., "Khan Asim Iqbal")</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Phone Number</p>
                        <p className="text-xs text-muted-foreground">The customer's phone number (e.g., "3457766748")</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Address</p>
                        <p className="text-xs text-muted-foreground">The customer's delivery address</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium text-sm">Status</p>
                        <p className="text-xs text-muted-foreground">The current status of the order (accepted values: "Not Responding", "To Process", "Confirmed", "Cancelled")</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important Note</AlertTitle>
                  <AlertDescription>
                    Make sure your phone numbers are in the correct format without any special characters. Pakistani numbers should ideally start with a 3.
                  </AlertDescription>
                </Alert>
                
                <div>
                  <h3 className="font-medium">Sample CSV Format</h3>
                  <div className="overflow-x-auto mt-2 border rounded">
                    <table className="w-full border-collapse min-w-full">
                      <thead>
                        <tr className="bg-muted">
                          <th className="px-3 py-2 text-sm font-medium text-left border">Lineitem name</th>
                          <th className="px-3 py-2 text-sm font-medium text-left border">Billing Name</th>
                          <th className="px-3 py-2 text-sm font-medium text-left border">Billing Phone</th>
                          <th className="px-3 py-2 text-sm font-medium text-left border">Billing Address</th>
                          <th className="px-3 py-2 text-sm font-medium text-left border">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-background">
                          <td className="px-3 py-2 text-sm border">Electric Callus Remover for Feet</td>
                          <td className="px-3 py-2 text-sm border">Khan Asim Iqbal</td>
                          <td className="px-3 py-2 text-sm border">3457766748</td>
                          <td className="px-3 py-2 text-sm border">House no. 403-B, Peoples Colony-1</td>
                          <td className="px-3 py-2 text-sm border">Not Responding</td>
                        </tr>
                        <tr className="bg-muted/50">
                          <td className="px-3 py-2 text-sm border">Electric Callus Remover for Feet</td>
                          <td className="px-3 py-2 text-sm border">Amna Malik</td>
                          <td className="px-3 py-2 text-sm border">3331925667</td>
                          <td className="px-3 py-2 text-sm border">House no. 123, Model Town</td>
                          <td className="px-3 py-2 text-sm border">To Process</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={downloadSampleCSV}
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Sample CSV
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CSVUpload;
