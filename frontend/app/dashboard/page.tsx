'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
  const router = useRouter()
  const [apiKey, setApiKey] = useState('')
  const [email, setEmail] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const key = localStorage.getItem('api_key')
    const em = localStorage.getItem('email')
    if (!key) {
      router.push('/auth/login')
      return
    }
    setApiKey(key)
    setEmail(em || '')
  }, [router])

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    localStorage.removeItem('api_key')
    localStorage.removeItem('email')
    router.push('/')
  }

  const embedCode = `<script src="https://ai-virtual-tryon-zeta.vercel.app/widget.js" data-api-key="${apiKey}"></script>`

  return (
    <main className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-indigo-600">TryOn.ai</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-800 font-medium">{email}</span>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-700 font-medium hover:text-red-500"
          >
            Log out
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Dashboard</h1>
        <p className="text-gray-600 text-sm mb-8">Manage your TryOn.ai integration</p>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Your API Key</h2>
          <p className="text-xs text-gray-500 mb-3">Keep this private. Use it in your embed code below.</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={apiKey}
              readOnly
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm font-mono bg-gray-50 text-gray-900"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Embed Code</h2>
          <p className="text-xs text-gray-500 mb-3">
            Paste this script tag into your website's HTML to add the try-on widget.
          </p>
          <div className="bg-gray-900 rounded-lg p-4 text-green-400 text-xs font-mono overflow-x-auto">
            {embedCode}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Plan</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700">Current plan: <span className="font-semibold text-indigo-600">Starter (Free)</span></p>
              <p className="text-xs text-gray-500 mt-1">50 try-ons per month included</p>
            </div>
            <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700">
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}