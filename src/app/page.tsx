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
          console.log('First row:', results.data[0]);

          const transformedData = results.data.map((row: any) => ({
            Code: row['Code']?.toString() || '',
            P75: row[' P75']?.toString() || ''  // Note the space before P75
          })).filter(row => row.Code && row.P75);

          console.log('Transformed data:', transformedData.slice(0, 5));
          setData(transformedData);
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
    if (!value.trim()) {
      setFilteredResults([]);
      return;
    }

    const filtered = data.filter(row => 
      row.Code.toLowerCase().includes(value.toLowerCase())
    );
    console.log('Search results:', filtered);
    setFilteredResults(filtered);
  };

  const handleSelect = (code: string, p75: string) => {
    console.log('Selected:', { code, p75 });
    setSelectedCode(code);
    setSelectedP75(p75);
  };

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">P75 Code Search</h1>
      
      <div className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="block mb-4"
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search for a code..."
          className="w-full p-2 border rounded"
        />

        {error && <p className="text-red-500">{error}</p>}

        {selectedCode && (
          <div className="p-4 bg-blue-100 rounded">
            <p>Code: {selectedCode}</p>
            <p className="text-lg font-bold">P75: {selectedP75}</p>
          </div>
        )}

        <div className="space-y-2">
          {filteredResults.map((result, index) => (
            <button
              key={index}
              onClick={() => handleSelect(result.Code, result.P75)}
              className="w-full p-2 text-left border rounded hover:bg-gray-100"
            >
              {result.Code} - P75: {result.P75}
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
