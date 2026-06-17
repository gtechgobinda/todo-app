import React, { useEffect, useState } from 'react'
import api from '../../api/axiosConfig'
import './taskList.css'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const getTasks = async () => {
      try {
        setIsLoading(true)
        setError('')

        const response = await api.get('/tasks')
        const taskList = Array.isArray(response.data)
          ? response.data
          : response.data?.data || response.data?.tasks || []

        setTasks(taskList)
      } catch (err) {
        setError(err.response?.data?.message || 'Unable to load tasks.')
      } finally {
        setIsLoading(false)
      }
    }

    getTasks()
  }, [])

  return (
    <main className="task-list">
      <section className="task-list__panel">
        <div className="task-list__header">
          <h1>Task List</h1>
          <p>Review the tasks you have added and keep your work organized.</p>
        </div>

        {isLoading && <p className="task-list__state">Loading tasks...</p>}

        {error && <p className="task-list__state task-list__state--error">{error}</p>}

        {!isLoading && !error && tasks.length === 0 && (
          <p className="task-list__state">No tasks found.</p>
        )}

        {!isLoading && !error && tasks.length > 0 && (
          <div className="task-list__items">
            {tasks.map((task, index) => (
              <article className="task-list__item" key={task._id || task.id || index}>
                <h2>{task.title}</h2>
                <p>{task.description}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default TaskList
