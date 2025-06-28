'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestDBPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing')
  const [tables, setTables] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus('testing')
      
      // Test 1: Basic connection
      const { error } = await supabase
        .from('users')
        .select('count')
        .limit(1)

      if (error) {
        throw new Error(`Database query failed: ${error.message}`)
      }

      // Test 2: Check if our tables exist by trying to query each expected table
      const expectedTables = ['users', 'markets', 'bets', 'bet_participants', 'arbitrator_decisions', 'credit_transactions']
      const existingTables: string[] = []

      for (const table of expectedTables) {
        try {
          const { error: tableError } = await supabase.from(table).select('count').limit(1)
          if (!tableError) {
            existingTables.push(table)
          }
        } catch (e) {
          console.log(`Table ${table} not accessible:`, e)
        }
      }
      setTables(existingTables)

      setConnectionStatus('success')
    } catch (err) {
      console.error('Connection test failed:', err)
      setConnectionStatus('error')
      setError(err instanceof Error ? err.message : String(err))
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Database Connection Test</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Connection Status</h2>
          <div className={`p-3 rounded-lg ${
            connectionStatus === 'testing' ? 'bg-yellow-100 text-yellow-800' :
            connectionStatus === 'success' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {connectionStatus === 'testing' && '🔄 Testing connection...'}
            {connectionStatus === 'success' && '✅ Connection successful!'}
            {connectionStatus === 'error' && `❌ Connection failed: ${error}`}
          </div>
        </div>

        {connectionStatus === 'success' && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Database Tables</h2>
            <div className="bg-gray-50 p-3 rounded-lg">
              {tables.length > 0 ? (
                <ul className="list-disc list-inside">
                  {tables.map(table => (
                    <li key={table} className="text-sm text-gray-700">{table}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-600">No tables detected or insufficient permissions</p>
              )}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Configuration</h2>
          <div className="bg-gray-50 p-3 rounded-lg text-sm">
            <p><strong>Supabase URL:</strong> {typeof window !== 'undefined' ? process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set' : 'Loading...'}</p>
            <p><strong>Anon Key:</strong> {typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Not set') : 'Loading...'}</p>
          </div>
        </div>

        <button
          onClick={testConnection}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Retry Connection Test
        </button>
      </div>
    </div>
  )
}
