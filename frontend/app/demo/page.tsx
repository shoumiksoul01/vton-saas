'use client'

import { useState } from 'react'
import { tryOn } from '@/lib/api'

const STARTER_API_KEY = 'A38BeJL311uOIyZOPRU1Iz7UPS28diLol5oUgTZ9oW0'
const PRO_API_KEY = '4R-kurTWbgJ7JipU2z5z_F5m6773wb-mAtAKSpS_328'

interface Garment {
  id: string
  name: string
  image: string
  description: string
}

const garments: Garment[] = [
  { id: 'g1', name: 'Classic White Shirt', image: '/garments/white-shirt.jpg', description: 'a white formal cotton shirt' },
  { id: 'g2', name: 'Navy Blue Polo', image: '/garments/navy-polo.jpg', description: 'a navy blue polo t-shirt' },
  { id: 'g3', name: 'Striped Oxford', image: '/garments/striped-oxford.jpg', description: 'a blue and white striped oxford shirt' },
  { id: 'g4', name: 'Black Crew Neck Tee', image: '/garments/black-tee.jpg', description: 'a plain black crew neck t-shirt' },
]

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function imageUrlToBase64(url: string): Promise<string> {
  const res = await fetch(url)
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

export default function DemoPage() {
  const [selectedGarment, setSelectedGarment] = useState<Garment | null>(null)
  const [personFile, setPersonFile] = useState<File | null>(null)
  const [personPreview, setPersonPreview] = useState<string | null>(null)
  const [quality, setQuality] = useState<'starter' | 'pro'>('starter')
  const [loading, setLoading] = useState(false)
  const [resultImage, setResultImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPersonFile(file)
    setPersonPreview(URL.createObjectURL(file))
    setResultImage(null)
    setError(null)
  }

  async function handleTryOn() {
    if (!personFile || !selectedGarment) {
      setError('Please upload a photo and select a garment.')
      return
    }

    setLoading(true)
    setError(null)
    setResultImage(null)

    try {
      const apiKey = quality === 'starter' ? STARTER_API_KEY : PRO_API_KEY
      const personBase64 = await fileToBase64(personFile)
      const garmentBase64 = await imageUrlToBase64(selectedGarment.image)

      const res = await tryOn(apiKey, personBase64, garmentBase64, selectedGarment.description)

      if (res.result_image) {
        setResultImage(`data:image/png;base64,${res.result_image}`)
      } else {
        setError(res.detail || res.error || 'Try-on failed. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    if (!resultImage) return
    const link = document.createElement('a')
    link.href = resultImage
    link.download = `tryon-result-${quality}.png`
    link.click()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fake shop header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-bold text-gray-900">Fashion Store BD</h1>
        <p className="text-sm text-gray-500">Powered by TryOn.ai</p>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Quality toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setQuality('starter')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                quality === 'starter' ? 'bg-gray-900 text-white' : 'text-gray-600'
              }`}
            >
              Starter
            </button>
            <button
              onClick={() => setQuality('pro')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                quality === 'pro' ? 'bg-gray-900 text-white' : 'text-gray-600'
              }`}
            >
              Pro ✨
            </button>
          </div>
        </div>

        {/* Step 1: Upload photo */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">1 — Upload your photo</h2>
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer bg-white text-gray-900">
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            {personPreview ? (
              <img src={personPreview} alt="preview" className="max-h-64 mx-auto rounded" />
            ) : (
              <span className="text-gray-500">Click or drag image here</span>
            )}
          </label>
        </section>

        {/* Step 2: Select garment */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold text-gray-900 mb-2">2 — Select a garment</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {garments.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGarment(g)}
                className={`border rounded-lg overflow-hidden bg-white text-left ${
                  selectedGarment?.id === g.id ? 'ring-2 ring-gray-900' : 'border-gray-200'
                }`}
              >
                <img src={g.image} alt={g.name} className="w-full h-40 object-cover" />
                <div className="p-2">
                  <p className="text-sm font-medium text-gray-900">{g.name}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Try on button */}
        <button
          onClick={handleTryOn}
          disabled={loading}
          className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Generating (this may take up to 2 minutes)...' : 'Try it on'}
        </button>

        {error && <p className="text-red-600 text-sm mt-3">{error}</p>}

        {/* Result */}
        {resultImage && (
          <section className="mt-8">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-sm font-semibold text-gray-900">Result</h2>
              <span className={`text-xs px-2 py-1 rounded-full ${
                quality === 'pro' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {quality === 'pro' ? 'Pro ✨' : 'Starter'}
              </span>
            </div>
            <img src={resultImage} alt="result" className="rounded-lg max-w-md w-full" />
            <button
              onClick={handleDownload}
              className="mt-4 block bg-white border border-gray-300 text-gray-900 px-4 py-2 rounded-lg text-sm"
            >
              Download
            </button>
          </section>
        )}
      </main>
    </div>
  )
}