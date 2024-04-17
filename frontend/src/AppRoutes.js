import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home/Home'
import Portfolio from './pages/Portfolio/Portfolio'
import About from './pages/About/About'
import Error404 from './components/Error/Error404'


export default function Approutes() {
  return (
    <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/Portfolio' element={<Portfolio />} />
        <Route path='/About' element={<About />} />
        <Route path='*' element={<Error404 />} />
    </Routes>
  )
}
