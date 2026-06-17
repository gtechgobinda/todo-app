import React from 'react'
import NavBar from './components/NavBar'
import { Route, Routes } from 'react-router-dom'
import AddTask from './components/AddTask'
import TaskList from './components/TaskList/TaskList'
import AIAssistant from './components/AIAssistant/AIAssistant'

const App = () => {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path='/' element={<TaskList/>}/>
        <Route path='/add' element={<AddTask />}/>
      </Routes>
      <AIAssistant />
    </>
  )
}

export default App
