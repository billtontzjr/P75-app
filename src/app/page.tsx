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
    reader.onload = (e: ProgressEvent<FileReader>) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') return;

        Papa.parse<CSVRow>(text, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header) => header.trim(),
          complete: (results) => {
            console.log('Raw CSV text:', text);
            console.log('Parsed CSV data:', results.data);
            console.log('Column names:', results.meta.fields);
            setData(results.data);
            setFilteredResults(results.data);
          },
          error: (error) => {
            console.error('Papa Parse error:', error);
          }
        });
      } catch (error: any) {
        setError('Error reading file: ' + error.message)
      }
    };
    reader.onerror = () => {
      setError('Error reading file')
    }

    reader.readAsText(file)
  };

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
