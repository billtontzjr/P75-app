'use client';

import { useState } from 'react';
import Papa from 'papaparse';

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
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      try {
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('Raw CSV text:', text.substring(0, 200)); // Show first 200 chars
            console.log('Column names:', results.meta.fields);
            
            if (!results.data || results.data.length === 0) {
              setError('No data found in CSV');
              return;
            }

            // Log the first row to see its structure
            console.log('First row:', results.data[0]);

            // Transform the data
            const transformedData = results.data
              .map((row: any) => {
                // Handle both possible column names
                const code = row['Code'] || row.Code;
                const p75 = row[' P75'] || row.P75 || row['P75'];
                
                console.log('Processing row:', { code, p75, original: row });
                
                return {
                  Code: code?.toString().trim(),
                  P75: p75?.toString().trim()
                };
              })
              .filter(row => row.Code && row.P75);

            console.log('First 5 transformed rows:', transformedData.slice(0, 5));
            
            if (transformedData.length === 0) {
              setError('No valid data found after processing');
              return;
            }

            setData(transformedData);
            setIsFileLoaded(true);
            setError('');
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            setError('Error parsing CSV: ' + error.message);
          }
        });
      } catch (error: any) {
        console.error('File processing error:', error);
        setError('Error processing file: ' + error.message);
      }
    };

    reader.onerror = () => {
      setError('Error reading file');
    };

    reader.readAsText(file);
  };

  const handleSearch = (searchValue: string) => {
    console.log('Searching for:', searchValue);
    console.log('Available data:', data.slice(0, 5));
    
    setSearchTerm(searchValue);
    setSelectedCode('');
    setSelectedP75('');
    
    if (!searchValue.trim()) {
      setFilteredResults([]);
      return;
    }

    const filtered = data
      .filter(row => {
        const match = row.Code.toLowerCase().includes(searchValue.toLowerCase());
        console.log(`Checking ${row.Code} (${row.P75}): ${match}`);
        return match;
      })
      .slice(0, 10);

    console.log('Filtered results:', filtered);
    setFilteredResults(filtered);
  };

  const handleCodeSelect = (code: string, p75: string) => {
    console.log('Selected:', { code, p75 });
    setSelectedCode(code);
    setSelectedP75(p75);
    setSearchTerm(code);
    setFilteredResults([]);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">P75 Code Search</h1>
        
        <div className="space-y-6">
          <div>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Enter Code..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full p-2 border rounded-md"
            />
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
                {selectedCode && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-800/30 p-6 rounded-lg"
                  >
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-gray-200 mb-2">P75 Value for Code {selectedCode}</h3>
                      <p className="text-3xl font-bold text-blue-400">
                        {selectedP75}
                      </p>
                    </div>
                  </motion.div>
                )}
                {!selectedCode && filteredResults.length > 0 && (
                  <div className="space-y-2">
                    {filteredResults.map((item, index) => (
                      <motion.button
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleCodeSelect(item.Code, item.P75)}
                        className="w-full text-left p-3 bg-gray-800/30 hover:bg-gray-700/30 rounded-lg text-gray-200 transition-colors duration-200"
                      >
                        <span className="font-medium">{item.Code}</span>
                        <span className="text-gray-400 ml-4">Click to view P75 value</span>
                      </motion.button>
                    ))}
                  </div>
                )}
                {searchTerm && filteredResults.length === 0 && !selectedCode && (
                  <div className="text-center text-gray-400">No matching codes found</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
