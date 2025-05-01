import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import ProfileEditPage from './pages/ProfileEditPage'
// import Header from './layouts/Header';

function App() {
  return (
    // <div className="flex flex-col min-h-screen w-full">
        // <Header />
    <Routes>
      {/* 메인 레이아웃을 사용하는 페이지들 */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
      
      {/* 별도 레이아웃을 사용하는 페이지들 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/profile/edit" element={<ProfileEditPage />} />
    </Routes>
    // </div>
  )
}

export default App 