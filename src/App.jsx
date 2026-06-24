import React, { useState, useEffect, useCallback } from 'react'
import NavBar from './components/NavBar'
import { Route, Routes, Navigate } from 'react-router-dom'
import AddTask from './components/AddTask'
import KanbanBoard from './components/KanbanBoard/KanbanBoard'
import AIAssistant from './components/AIAssistant/AIAssistant'
import Auth from './components/Auth/Auth'
import api from './api/axiosConfig'

const App = () => {
  const [user, setUser] = useState(() => localStorage.getItem('userEmail'))
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState('')

  const handleAuth = (email) => {
    setUser(email)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userEmail')
    setUser(null)
    setTasks([])
  }

  const fetchTasks = useCallback(async () => {
    try {
      setTasksLoading(true)
      setTasksError('')
      const response = await api.get('/tasks')
      const taskList = Array.isArray(response.data)
        ? response.data
        : response.data?.data || response.data?.tasks || []
      setTasks(taskList)
    } catch (err) {
      if (err.response?.status === 401) {
        handleLogout()
      } else {
        setTasksError(err.response?.data?.message || 'Unable to load tasks.')
      }
    } finally {
      setTasksLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchTasks()
    } else {
      setTasksLoading(false)
    }
  }, [user, fetchTasks])

  if (!user) {
    return <Auth onAuth={handleAuth} />
  }

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        <Route
          path='/'
          element={
            <KanbanBoard
              tasks={tasks}
              setTasks={setTasks}
              isLoading={tasksLoading}
              error={tasksError}
            />
          }
        />
        <Route path='/add' element={<AddTask onTaskAdded={fetchTasks} />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <AIAssistant tasks={tasks} onRefetch={fetchTasks} />
    </>
  )
}

export default App
