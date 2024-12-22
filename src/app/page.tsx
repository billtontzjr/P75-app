'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface CSVRow {
  Code: string;
  P75: string;
}

export default function Home() {
  const [results, setResults] = useState<CSVRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredResults, setFilteredResults] = useState<CSVRow[]>([]);

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
          complete: (results) => {
            console.log('Parsed CSV data:', results.data);
            console.log('Column names:', results.meta.fields);
            setResults(results.data);
            setFilteredResults(results.data);
          },
        });
      } catch (error) {
        console.error('Error parsing CSV:', error);
      }
    };
    reader.readAsText(file);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    const filtered = results.filter((row) =>
      row.Code.toLowerCase().includes(term)
    );
    setFilteredResults(filtered);
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

          <div className="bg-white rounded-lg shadow">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                    P75 Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((row, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-pre-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
                      {row.Code}
                    </td>
                    <td className="px-6 py-4 whitespace-pre-wrap border-b border-gray-200 text-sm leading-5 text-gray-500">
                      {row.P75}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
