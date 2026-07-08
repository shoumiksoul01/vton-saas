import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b">
        <span className="text-xl font-bold text-indigo-600">TryOn.ai</span>
        <div className="flex gap-4">
          <Link href="/auth/login" className="text-gray-600 hover:text-indigo-600">Login</Link>
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">Get Started Free</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-8 py-24 bg-gradient-to-b from-indigo-50 to-white">
        <span className="bg-indigo-100 text-indigo-600 text-sm font-medium px-4 py-1 rounded-full mb-6">AI-Powered Virtual Try-On for Clothing Shops</span>
        <h1 className="text-5xl font-bold text-gray-900 max-w-3xl mb-6">Let Your Customers Try Before They Buy</h1>
        <p className="text-xl text-gray-500 max-w-2xl mb-10">Embed our AI virtual try-on widget in your online shop in minutes. Reduce returns, boost confidence, increase sales.</p>
        <div className="flex gap-4">
          <Link href="/auth/signup" className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700">Start Free — No Credit Card</Link>
          <Link href="/demo" className="border border-gray-300 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50">See Live Demo</Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-8 py-20 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { step: '1', title: 'Sign Up & Get API Key', desc: 'Create your free account and get a unique API key instantly.' },
            { step: '2', title: 'Embed One Line of Code', desc: 'Paste a single script tag into your website. No coding skills needed.' },
            { step: '3', title: 'Customers Try On Clothes', desc: 'Your customers upload their photo and see themselves wearing your products.' },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center text-center p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xl font-bold mb-4">{item.step}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-8 py-20 bg-gray-50">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Starter</h3>
            <div className="text-4xl font-bold text-gray-900 mb-1">Free</div>
            <p className="text-gray-500 mb-6">Perfect for small shops getting started</p>
            <ul className="space-y-3 mb-8">
              {['50 try-ons per month', 'AI-powered results', 'Easy embed widget', 'Email support'].map((f) => (
                <li key={f} className="flex items-center gap-2 text-gray-700">
                  <span className="text-indigo-600">✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block text-center bg-gray-100 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-gray-200">Get Started Free</Link>
          </div>
          {/* Pro */}
          <div className="bg-indigo-600 rounded-2xl p-8 text-white">
            <h3 className="text-xl font-bold mb-2">Pro</h3>
            <div className="text-4xl font-bold mb-1">৳2,500<span className="text-lg font-normal">/mo</span></div>
            <p className="text-indigo-200 mb-6">For growing shops that need more</p>
            <ul className="space-y-3 mb-8">
              {['Unlimited try-ons', 'Premium AI quality', 'No watermark', 'Priority support', 'Advanced analytics'].map((f) => (
                <li key={f} className="flex items-center gap-2">
                  <span>✓</span>{f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="block text-center bg-white text-indigo-600 px-6 py-3 rounded-xl font-semibold hover:bg-indigo-50">Upgrade to Pro</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t">
        © 2025 TryOn.ai — Built for clothing shops in Bangladesh
      </footer>
    </main>
  )
}