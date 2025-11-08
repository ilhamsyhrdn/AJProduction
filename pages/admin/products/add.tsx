import { useState, useEffect } from 'react'
// import Image from 'next/image'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { toast } from 'sonner'
import { LayoutDashboard, ShoppingCart, Package, MessageSquare, ArrowLeft, Save } from 'lucide-react'

export default function AddProductPage() {
  const router = useRouter()

  const [formData, setFormData] = useState<{ name: string; category: string; price: number; stock: number; description: string; image?: string }>({
    name: '',
    category: '',
    price: 0,
    stock: 0,
    description: '',
    image: ''
  })

  const [imageMode, setImageMode] = useState<'upload' | 'link'>('upload')
  const [imagePreview, setImagePreview] = useState<string>('')
  const [imageName, setImageName] = useState<string>('')
  const [displayPrice, setDisplayPrice] = useState<string>('')
  const [displayStock, setDisplayStock] = useState<string>('')

  useEffect(() => {
    const session = localStorage.getItem('adminSession')
    if (!session) {
      router.replace('/admin/login')
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const session = localStorage.getItem('adminSession')
    if (!session) {
      toast.error('Session expired. Please login again.')
      router.push('/admin/login')
      return
    }
    const admin = JSON.parse(session)

    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': admin.email,
          'x-admin-role': admin.role,
        },
        body: JSON.stringify({
          ...formData,
          // Ensure numbers are clean
          price: Number(formData.price) || 0,
          stock: Number(formData.stock) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.message || 'Failed to add product')
      }

      toast.success('Produk berhasil ditambahkan')
      router.push('/admin/products')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal menambahkan produk'
      console.error(err)
      toast.error(message)
    }
  }

  const normalizeDriveLink = (url: string) => {
    try {
      // Matches: https://drive.google.com/file/d/<FILE_ID>/view?usp=sharing
      const match1 = url.match(/drive\.google\.com\/file\/d\/([^/]+)/)
      if (match1?.[1]) return `https://drive.google.com/uc?export=view&id=${match1[1]}`
      // Matches: https://drive.google.com/open?id=<FILE_ID>
      const match2 = url.match(/[?&]id=([^&]+)/)
      if (match2?.[1]) return `https://drive.google.com/uc?export=view&id=${match2[1]}`
      return url
    } catch {
      return url
    }
  }

  const handleFileChange = (file?: File | null) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const dataUrl = reader.result as string
      setFormData((prev) => ({ ...prev, image: dataUrl }))
      setImagePreview(dataUrl)
      setImageName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const formatGrouping = (n: number) => new Intl.NumberFormat('id-ID').format(n)

  const onPriceChange = (val: string) => {
    const digits = val.replace(/\D/g, '') // keep digits only
    const num = digits ? parseInt(digits, 10) : 0
    setFormData((prev) => ({ ...prev, price: num }))
    setDisplayPrice(digits ? formatGrouping(num) : '')
  }

  const onStockChange = (val: string) => {
    const digits = val.replace(/\D/g, '')
    const num = digits ? parseInt(digits, 10) : 0
    setFormData((prev) => ({ ...prev, stock: num }))
    setDisplayStock(digits ? String(num) : '')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">AJ Production</h1>
              <p className="text-sm text-gray-500 mt-0.5">Admin Dashboard - Add Product</p>
            </div>
            <Link href="/admin/products" className="inline-flex items-center gap-2 px-4 py-2 border-2 border-black rounded-md text-black hover:bg-black hover:text-white transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>

          {/* Nav - keep consistent and symmetric */}
          <nav className="mt-4 flex items-center gap-4 overflow-x-auto pb-2">
            <Link href="/admin/dashboard">
              <div className="w-44 h-11 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-sm hover:bg-black hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 px-4">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </div>
            </Link>
            <Link href="/admin/orders">
              <div className="w-44 h-11 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-sm hover:bg-black hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 px-4">
                <ShoppingCart className="h-5 w-5" />
                <span>Orders</span>
              </div>
            </Link>
            <Link href="/admin/products">
              <div className="w-44 h-11 bg-black text-white border-2 border-black font-semibold rounded-lg shadow-sm transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 px-4">
                <Package className="h-5 w-5" />
                <span>Products</span>
              </div>
            </Link>
            <Link href="/admin/messages">
              <div className="w-44 h-11 bg-white border-2 border-black text-black font-semibold rounded-lg shadow-sm hover:bg-black hover:text-white transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 px-4">
                <MessageSquare className="h-5 w-5" />
                <span>Messages</span>
              </div>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-white border-2 border-gray-200 rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6">Add New Product</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-2.5 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none"
                autoComplete="off"
                style={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: 8 }}
                placeholder="e.g., Es Kristal AJ 20kg"
              />
            </div>

            {/* Stack all fields vertically for symmetric spacing */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none"
                  autoComplete="off"
                  style={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: 8 }}
                  placeholder="e.g., Beverage"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (IDR)</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayPrice}
                  onChange={(e) => onPriceChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none"
                  autoComplete="off"
                  style={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: 8 }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayStock}
                  onChange={(e) => onStockChange(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-2.5 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none"
                  autoComplete="off"
                  style={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: 8 }}
                />
              </div>
            </div>

            {/* Image section: upload or link (incl. Google Drive) */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Product Image</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setImageMode('upload')}
                  className={`px-3 py-2 text-sm rounded-md border ${imageMode === 'upload' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                  style={{ minWidth: '170px', minHeight: '40px' }}
                >
                  Upload from device
                </button>
                <button
                  type="button"
                  onClick={() => setImageMode('link')}
                  className={`px-3 py-2 text-sm rounded-md border ${imageMode === 'link' ? 'bg-black text-white border-black' : 'bg-white text-black border-black'}`}
                  style={{ minWidth: '170px', minHeight: '40px' }}
                >
                  Use link / Google Drive
                </button>
              </div>

              {imageMode === 'upload' ? (
                <div className="space-y-2">
                  <input
                    id="product-image-file"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files?.[0])}
                    className="sr-only"
                  />
                  <label
                    htmlFor="product-image-file"
                    className="inline-flex items-center justify-center px-3 py-2 text-sm rounded-md border transition-colors cursor-pointer"
                    style={{
                      backgroundColor: '#000000',
                      color: '#ffffff',
                      borderColor: '#000000',
                      minWidth: '85px',
                      minHeight: '40px'
                    }}
                  >
                    Pilih File
                  </label>
                  {imageName && (
                    <div className="text-sm text-gray-600">{imageName}</div>
                  )}
                  {imagePreview && (
                    // Base64 preview; next/image would not optimize meaningfully
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imagePreview} alt="Preview" className="mt-2 h-32 w-auto rounded-md border border-gray-300" />
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.image || ''}
                    onChange={(e) => setFormData({ ...formData, image: normalizeDriveLink(e.target.value) })}
                    placeholder="https://... (supports Google Drive share links)"
                    className="w-full px-4 py-2.5 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none"
                    style={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: 8 }}
                  />
                  {formData.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.image} alt="Preview" className="mt-2 h-32 w-auto rounded-md border border-gray-300" />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-2.5 rounded-md text-gray-900 placeholder:text-gray-500 focus:outline-none"
                style={{ backgroundColor: '#ffffff', border: '2px solid #000000', borderRadius: 8 }}
                placeholder="Describe the product..."
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link
                href="/admin/products"
                className="px-3 py-2 text-sm rounded-md border transition-colors"
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderColor: '#000000',
                  minWidth: '170px',
                  minHeight: '40px',
                  textAlign: 'center'
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                className="px-3 py-2 text-sm rounded-md border transition-colors"
                style={{
                  backgroundColor: '#000000',
                  color: '#ffffff',
                  borderColor: '#000000',
                  minWidth: '170px',
                  minHeight: '40px'
                }}
              >
                <span className="inline-flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Product
                </span>
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
