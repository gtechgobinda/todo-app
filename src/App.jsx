import React from 'react'
import NavBar from './components/NavBar'
import { Route, Routes } from 'react-router-dom'
import AddTask from './components/AddTask'

const App = () => {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={<h1>Task LIST</h1>}/>
        <Route path='/add' element={<AddTask />}/>
      </Routes>
    </>
  )
}

export default App
