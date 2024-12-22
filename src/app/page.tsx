'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Upload, AlertCircle } from 'lucide-react'
import Papa from 'papaparse'

interface CSVRow {
  Code: string;
  [key: string]: string;  // For P75 and any other columns
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('')
  const [data, setData] = useState<CSVRow[]>([])
  const [filteredResults, setFilteredResults] = useState<CSVRow[]>([])
  const [fileName, setFileName] = useState('')
  const [error, setError] = useState('')
  const [isFileLoaded, setIsFileLoaded] = useState(false)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setError('Please upload a CSV file')
        return
      }

      setFileName(file.name)
      const reader = new FileReader()
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result
          if (typeof result !== 'string') {
            setError('Error reading file')
            return
          }
          Papa.parse(result, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
              if (results.data && results.data.length > 0) {
                // Validate CSV structure
                const firstRow = results.data[0] as CSVRow
                if (!('Code' in firstRow) || !Object.keys(firstRow).some(key => key.includes('P75'))) {
                  setError('CSV must contain "Code" and "P75" columns')
                  return
                }
                setData(results.data as CSVRow[])
                setIsFileLoaded(true)
                setError('')
              } else {
                setError('No data found in CSV file')
              }
            },
            error: (error: Papa.ParseError) => {
              setError('Error parsing CSV file: ' + error.message)
            }
          })
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
    setSearchTerm(searchValue)
    if (searchValue) {
      const results = data.filter((item: CSVRow) => 
        item.Code?.toLowerCase().includes(searchValue.toLowerCase())
      )
      setFilteredResults(results.slice(0, 10))
    } else {
      setFilteredResults([])
    }
  }

  const formatP75 = (item: CSVRow) => {
    const p75Key = Object.keys(item).find(key => key.includes('P75'))
    return p75Key ? item[p75Key].trim() : 'N/A'
  }

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
                  placeholder="Search by code..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-100 placeholder-gray-400"
                />
              </div>

              {/* Results Section */}
              <div className="space-y-4">
                {filteredResults.length > 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2 gap-4"
                  >
                    <div className="text-sm font-medium text-gray-400">Code</div>
                    <div className="text-sm font-medium text-gray-400">P75 Value</div>
                    {filteredResults.map((item: CSVRow, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="contents"
                      >
                        <div className="bg-gray-800/30 p-3 rounded-lg text-gray-200">{item.Code}</div>
                        <div className="bg-gray-800/30 p-3 rounded-lg text-gray-200">{formatP75(item)}</div>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : searchTerm ? (
                  <div className="text-center text-gray-400">No results found</div>
                ) : (
                  <div className="text-center text-gray-400">Enter a code to search</div>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
