'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface CSVRow {
  Code: string;
  P75: string;
}

export default function Home() {
  const [data, setData] = useState<CSVRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState<CSVRow[]>([]);
  const [selectedCode, setSelectedCode] = useState('');
  const [selectedP75, setSelectedP75] = useState('');
  const [error, setError] = useState('');
  const [isFileLoaded, setIsFileLoaded] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text !== 'string') return;

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Column names:', results.meta.fields);
          
          // Transform the data with exact column names
          const transformedData = results.data
            .map((row: any) => ({
              Code: row['Code']?.toString() || '',
              P75: row['P75']?.toString() || ''  
            }))
            .filter(row => row.Code && row.P75);

          setData(transformedData);
          setIsFileLoaded(true);
          setError('');
        },
        error: (error) => {
          console.error('Error:', error);
          setError(error.message);
        }
      });
    };
    reader.readAsText(file);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setSelectedCode('');
    setSelectedP75('');
    
    if (!value.trim()) {
      setFilteredResults([]);
      return;
    }

    const filtered = data
      .filter(row => row.Code.toLowerCase().includes(value.toLowerCase()))
      .slice(0, 10); // Limit to 10 results
    setFilteredResults(filtered);
  };

  const handleSelect = (code: string, p75: string) => {
    setSelectedCode(code);
    setSelectedP75(p75);
    setSearchTerm(code);
    setFilteredResults([]); // Clear results after selection
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">P75 Code Search</h1>
      
      <div className="space-y-4">
        <div className="mb-6">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="block w-full text-sm text-gray-500 mb-2"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {isFileLoaded && (
          <div className="space-y-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Enter a code to search..."
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {selectedCode && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-600">Selected Code:</p>
                <p className="text-lg font-bold">{selectedCode}</p>
                <p className="text-sm text-gray-600 mt-2">P75 Value:</p>
                <p className="text-2xl font-bold text-blue-600">{selectedP75}</p>
              </div>
            )}

            {!selectedCode && searchTerm && filteredResults.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                {filteredResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(result.Code, result.P75)}
                    className="w-full p-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                  >
                    <span className="font-medium">{result.Code}</span>
                  </button>
                ))}
              </div>
            )}

            {searchTerm && filteredResults.length === 0 && (
              <p className="text-gray-500 text-center py-2">No matching codes found</p>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
