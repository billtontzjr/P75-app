'use client';

import { useState } from 'react';
import Papa from 'papaparse';

interface CSVRow {
  Code: string;
  P75: string;
}

interface SelectedItem {
  code: string;
  p75: string;
}

export default function Home() {
  const [data, setData] = useState<CSVRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [error, setError] = useState('');
  const [isFileLoaded, setIsFileLoaded] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (!text || typeof text !== 'string') return;

      Papa.parse<CSVRow>(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          console.log('Raw data sample:', results.data[0]);
          console.log('Column names:', results.meta.fields);
          
          // Transform the data, handling the space in ' P75' column name
          const transformedData = results.data
            .map((row: any) => {
              const code = row['Code']?.toString();
              const p75 = row[' P75']?.toString(); // Note the space before P75
              
              if (!code || !p75) {
                console.log('Skipping invalid row:', row);
                return null;
              }
              
              return {
                Code: code.trim(),
                P75: p75.trim()
              };
            })
            .filter((row): row is CSVRow => row !== null);

          console.log('Transformed data sample:', transformedData[0]);
          setData(transformedData);
          setIsFileLoaded(true);
          setError('');
        },
        error: (error: Papa.ParseError) => {
          console.error('Error:', error);
          setError(error.message || 'Error parsing CSV file');
        }
      });
    };
    reader.readAsText(file);
  };

  const handleCodeInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' || event.key === ' ' || event.key === ',') {
      event.preventDefault();
      const code = searchTerm.trim();
      
      if (code) {
        const match = data.find(row => row.Code === code);
        if (match) {
          // Check if code already exists
          if (!selectedItems.some(item => item.code === code)) {
            setSelectedItems(prev => [...prev, { code: match.Code, p75: match.P75 }]);
          }
        } else {
          console.log('No match found for code:', code);
        }
        setSearchTerm('');
      }
    }
  };

  const removeItem = (code: string) => {
    setSelectedItems(prev => prev.filter(item => item.code !== code));
  };

  return (
    <main className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">P75 Code Search</h1>
      
      <div className="space-y-6">
        <div>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Enter codes (press Enter, Space, or Comma to add)
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleCodeInput}
                placeholder="Enter a code..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {selectedItems.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">P75 Value</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedItems.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {item.code}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.p75}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <button
                            onClick={() => removeItem(item.code)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
