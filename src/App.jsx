import React, { useState, useEffect, useCallback } from 'react'
import NavBar from './components/NavBar'
import { Route, Routes } from 'react-router-dom'
import AddTask from './components/AddTask'
import TaskList from './components/TaskList/TaskList'
import AIAssistant from './components/AIAssistant/AIAssistant'
import api from './api/axiosConfig'

const App = () => {
  const [tasks, setTasks] = useState([])
  const [tasksLoading, setTasksLoading] = useState(true)
  const [tasksError, setTasksError] = useState('')

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
      setTasksError(err.response?.data?.message || 'Unable to load tasks.')
    } finally {
      setTasksLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return (
    <>
      <NavBar />
      <Routes>
        <Route
          path='/'
          element={
            <TaskList
              tasks={tasks}
              setTasks={setTasks}
              isLoading={tasksLoading}
              error={tasksError}
              onRefetch={fetchTasks}
            />
          }
        />
        <Route path='/add' element={<AddTask onTaskAdded={fetchTasks} />} />
      </Routes>
      <AIAssistant tasks={tasks} onRefetch={fetchTasks} />
    </>
  )
}

export default App
