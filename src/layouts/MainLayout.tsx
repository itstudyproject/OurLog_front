import React from 'react'
import { Outlet } from 'react-router-dom'
import { cn } from '../utils/cn'
import Header from '../components/Header'

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-black">
      {/* <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <nav className="flex items-center justify-between">
            <div className="text-3xl font-semibold text-text-light">OurLog</div>
            <div className="flex items-center gap-8 text-text-medium">
              <a href="#" className="hover:text-text-light">경매</a>
              <a href="#" className="hover:text-text-light">아티스트</a>
              <a href="#" className="hover:text-text-light">로그인/회원가입</a>
            </div>
          </nav>
        </div>
      </header> */}
      <Header />
      <main className="pt-24">
        <Outlet />
      </main>
      
      <footer className="bg-black/80 mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="text-text-dark text-sm">
            © 2024 OurLog. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
} 