import React from 'react'
import { Routes, Route, Router } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import HomePage from './pages/HomePage'
// import Header from './layouts/Header';

function App() {
  return (
    // <div className="flex flex-col min-h-screen w-full">
        // <Header />
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
      </Route>
    </Routes>
    // </div>
  )
}


export default App 