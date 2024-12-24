'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Upload, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

interface CSVRow {
  Code: string;
  P75: string;
  [key: string]: string;  // For other columns
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<CSVRow[]>([])
  const [filteredResults, setFilteredResults] = useState<CSVRow[]>([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [isFileLoaded, setIsFileLoaded] = useState(false)
  const [selectedCode, setSelectedCode] = useState<string>('');
  const [selectedP75, setSelectedP75] = useState<string>('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }

      setFileName(file.name)
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          if (!e.target?.result || typeof e.target.result !== 'string') {
            setError('Error reading file')
            return
          }
          Papa.parse<CSVRow>(e.target.result, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header: string) => {
              // Remove any BOM characters, trim whitespace, and normalize column names
              const cleaned = header.replace(/^\ufeff/, '').trim();
              console.log('Raw header:', header, '-> cleaned:', cleaned);
              return cleaned;
            },
            complete: (results) => {
              if (!results.data || results.data.length === 0) {
                setError('No data found in CSV file');
                return;
              }

              try {
                // Get column names from the first row
                const firstRow = results.data[0] as CSVRow;
                const columns = Object.keys(firstRow);
                console.log('Available columns:', columns);

                // Find exact matches for our columns (with trimmed spaces)
                const codeColumn = columns.find(col => col.trim() === 'Code');
                const p75Column = columns.find(col => col.trim() === 'P75');

                if (!codeColumn || !p75Column) {
                  setError(`CSV must have "Code" and "P75" columns. Found: ${columns.join(', ')}`);
                  return;
                }

                console.log('Found columns:', { codeColumn, p75Column });

                // Transform the data
                const transformedData = results.data
                  .filter((row: any) => row && typeof row === 'object')
                  .map((row: any) => {
                    const code = row[codeColumn]?.toString().trim();
                    let p75 = row[p75Column]?.toString().trim();
                    console.log('Processing row:', { code, p75 });
                    return { Code: code, P75: p75 };
                  })
                  .filter(row => row.Code && row.P75); // Remove empty rows

                console.log('Sample of processed data:', transformedData.slice(0, 3));
                setData(transformedData);
                setIsFileLoaded(true);
                setError('');
              } catch (error) {
                console.error('Error processing CSV:', error);
                setError('Error processing CSV: ' + (error as Error).message);
              }
            },
            error: (error: Papa.ParseError) => {
              console.error('CSV parsing error:', error);
              setError('Error parsing CSV: ' + error.message);
            }
          });
        } catch (error: any) {
          setError('Error reading file: ' + error.message)
        }
      }

      reader.onerror = () => {
        setError('Error reading file')
      }

      reader.readAsText(file)
    }
  }

  const handleSearch = (searchValue: string) => {
    setSearchTerm(searchValue);
    setSelectedCode('');
    setSelectedP75('');
    
    if (!searchValue.trim()) {
      setFilteredResults([]);
      return;
    }

    try {
      const results = data
        .filter(item => {
          const code = item.Code?.toString().toLowerCase();
          const search = searchValue.toLowerCase();
          return code && code.includes(search);
        })
        .slice(0, 10);

      setFilteredResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setFilteredResults([]);
    }
  };

  const handleCodeSelect = (code: string, p75: string) => {
    setSelectedCode(code);
    setSelectedP75(p75);
    setSearchTerm(code);
    setFilteredResults([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="glass-morphism p-8 rounded-xl shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">P75 Code Search</h1>
            <p className="text-gray-400">Upload your CSV file and search for P75 codes</p>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-center w-full">
              <label className="gradient-border flex flex-col items-center justify-center w-full h-32 cursor-pointer hover:bg-opacity-50 transition-all duration-300">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2 text-blue-500" />
                  <p className="mb-2 text-sm text-gray-300">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-400">CSV file with Code and P75 columns</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            {fileName && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-400 text-center"
              >
                Selected file: {fileName}
              </motion.p>
            )}
            
            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded relative"
              >
                <div className="flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span>{error}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Search Section */}
          {isFileLoaded && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4 mt-8"
            >
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Enter code to search..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                />
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                {selectedCode ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/30 p-6 rounded-lg"
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-200 mb-2">P75 Value for Code {selectedCode}</h3>
                      <p className="text-2xl font-bold text-blue-400">
                        {selectedP75 || 'N/A'}
                      </p>
                    </div>
                  </motion.div>
                ) : filteredResults.length > 0 ? (
                  <div className="space-y-2">
                    {filteredResults.map((item, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => {
                          console.log('Selected item:', item);
                          handleCodeSelect(item.Code, item.P75);
                        }}
                        className="w-full text-left p-3 bg-gray-800/30 hover:bg-gray-700/30 rounded-lg text-gray-200 transition-colors duration-200"
                      >
                        <span className="font-medium">{item.Code}</span>
                        <span className="text-gray-400 ml-4">Click to view P75 value</span>
                      </motion.button>
                    ))}
                  </div>
                ) : searchTerm ? (
                  <div className="text-center text-gray-400">No matching codes found</div>
                ) : (
                  <div className="text-center text-gray-400">Enter a code to search</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
