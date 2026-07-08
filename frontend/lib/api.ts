const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'

export async function signUp(email: string, password: string, shopName: string) {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, shop_name: shopName })
  })
  return res.json()
}

export async function logIn(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

export async function tryOn(
  apiKey: string,
  personImageBase64: string,
  garmentImageBase64: string,
  garmentDescription: string = 'a shirt'
) {
  const res = await fetch(`${API_URL}/tryon`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify({
      person_image: personImageBase64,
      garment_image: garmentImageBase64,
      garment_description: garmentDescription
    })
  })
  return res.json()
}

export async function warmupBackend() {
  try {
    await fetch(`${API_URL}/health`)
  } catch (_) {}
}