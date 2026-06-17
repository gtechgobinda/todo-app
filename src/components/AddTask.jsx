import React, { useState } from 'react'
import api from '../api/axiosConfig'
import './addTask.css'

const AddTask = () => {
  const [task, setTask] = useState({
    title: '',
    description: '',
  })
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target

    setTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('')
    setError('')

    if (!task.title.trim() || !task.description.trim()) {
      setError('Please enter both title and description.')
      return
    }

    try {
      setIsSubmitting(true)
      await api.post('/add-task', {
        title: task.title.trim(),
        description: task.description.trim(),
      })

      setTask({
        title: '',
        description: '',
      })
      setStatus('Task added successfully.')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to add task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="add-task">
      <form className="add-task__form" onSubmit={handleSubmit}>
        <div className="add-task__header">
          <h1>Add New Task</h1>
          <p>Create a clear task with a short title and helpful description.</p>
        </div>

        <label className="add-task__field">
          <span>Title</span>
          <input
            type="text"
            name="title"
            value={task.title}
            onChange={handleChange}
            placeholder="Enter task title"
          />
        </label>

        <label className="add-task__field">
          <span>Description</span>
          <textarea
            name="description"
            value={task.description}
            onChange={handleChange}
            rows="5"
            placeholder="Write task details"
          />
        </label>

        {status && <p className="add-task__message add-task__message--success">{status}</p>}
        {error && <p className="add-task__message add-task__message--error">{error}</p>}

        <button className="add-task__button" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Task'}
        </button>
      </form>
    </main>
  )
}

export default AddTask
