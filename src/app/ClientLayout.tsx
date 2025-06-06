'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProfileModal from '@/components/ProfileModal'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { initAOS, refreshAOS } from '@/utils/aosUtils'

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, user, logout, updateUser } = useAuth()
  const [showProfileModal, setShowProfileModal] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  // Initialize AOS
  useEffect(() => {
    initAOS()
  }, [])

  // Refresh AOS on route change
  useEffect(() => {
    refreshAOS()
  }, [pathname])

  // Pages that should not show header/footer (auth pages)
  const hideHeaderFooter = pathname?.startsWith('/auth/') || false

  const handleLogout = () => {
    logout()
    setShowProfileModal(false)
  }

  const handleProfileClick = () => {
    setShowProfileModal(true)
  }

  const handleBrowseClick = () => {
    router.push('/browse')
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Conditionally render Navbar */}
      {!hideHeaderFooter && (
        <Navbar 
          isLoggedIn={isLoggedIn}
          user={user}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
          onBrowseClick={handleBrowseClick}
        />
      )}

      {/* Main content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Conditionally render Footer */}
      {!hideHeaderFooter && <Footer />}

      {/* Profile Modal */}
      {showProfileModal && !hideHeaderFooter && user && (
        <ProfileModal 
          user={user}
          onClose={() => setShowProfileModal(false)}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <LayoutContent>
        {children}
      </LayoutContent>
    </AuthProvider>
  )
}