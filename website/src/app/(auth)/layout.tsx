import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black">
      {/* Simple header with logo */}
      <div className="absolute top-0 left-0 right-0 p-4">
        <Link href="/" className="inline-flex items-center gap-2">
          <span className="text-xl font-bold text-amber-500">ATOMIC TAWK</span>
        </Link>
      </div>
      
      {children}
    </div>
  )
}
