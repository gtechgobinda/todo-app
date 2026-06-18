import React, { useState } from 'react'
import api from '../../api/axiosConfig'
import './taskList.css'

const TaskList = ({ tasks, setTasks, isLoading, error, onRefetch }) => {
  const [editingId, setEditingId] = useState('')
  const [editTask, setEditTask] = useState({ title: '', description: '' })
  const [actionError, setActionError] = useState('')
  const [actionMessage, setActionMessage] = useState('')
  const [activeTaskId, setActiveTaskId] = useState('')

  const getTaskId = (task) => task._id || task.id

  const startEdit = (task) => {
    setActionError('')
    setActionMessage('')
    setEditingId(getTaskId(task))
    setEditTask({ title: task.title || '', description: task.description || '' })
  }

  const cancelEdit = () => {
    setEditingId('')
    setEditTask({ title: '', description: '' })
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditTask((prev) => ({ ...prev, [name]: value }))
  }

  const updateTask = async (taskId) => {
    setActionError('')
    setActionMessage('')

    if (!editTask.title.trim() || !editTask.description.trim()) {
      setActionError('Please enter both title and description.')
      return
    }

    try {
      setActiveTaskId(taskId)
      const response = await api.put(`/tasks/${taskId}`, {
        title: editTask.title.trim(),
        description: editTask.description.trim(),
      })
      const updatedTask = response.data?.data || response.data?.task || {
        _id: taskId,
        title: editTask.title.trim(),
        description: editTask.description.trim(),
      }
      setTasks((prev) => prev.map((t) => getTaskId(t) === taskId ? { ...t, ...updatedTask } : t))
      setActionMessage('Task updated successfully.')
      cancelEdit()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to update task.')
    } finally {
      setActiveTaskId('')
    }
  }

  const deleteTask = async (taskId) => {
    setActionError('')
    setActionMessage('')

    try {
      setActiveTaskId(taskId)
      await api.delete(`/tasks/${taskId}`)
      setTasks((prev) => prev.filter((t) => getTaskId(t) !== taskId))
      setActionMessage('Task deleted successfully.')
      if (editingId === taskId) cancelEdit()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Unable to delete task.')
    } finally {
      setActiveTaskId('')
    }
  }

  return (
    <main className="task-list">
      <section className="task-list__panel">
        <div className="task-list__header">
          <h1>Task List</h1>
          <p>Review the tasks you have added and keep your work organized.</p>
        </div>

        {isLoading && <p className="task-list__state">Loading tasks...</p>}
        {error && <p className="task-list__state task-list__state--error">{error}</p>}
        {actionMessage && <p className="task-list__state task-list__state--success">{actionMessage}</p>}
        {actionError && <p className="task-list__state task-list__state--error">{actionError}</p>}

        {!isLoading && !error && tasks.length === 0 && (
          <p className="task-list__state">No tasks found.</p>
        )}

        {!isLoading && !error && tasks.length > 0 && (
          <div className="task-list__items">
            {tasks.map((task, index) => (
              <article className="task-list__item" key={getTaskId(task) || index}>
                {editingId === getTaskId(task) ? (
                  <div className="task-list__edit">
                    <label>
                      <span>Title</span>
                      <input
                        type="text"
                        name="title"
                        value={editTask.title}
                        onChange={handleEditChange}
                      />
                    </label>
                    <label>
                      <span>Description</span>
                      <textarea
                        name="description"
                        value={editTask.description}
                        onChange={handleEditChange}
                        rows="4"
                      />
                    </label>
                    <div className="task-list__actions">
                      <button
                        className="task-list__button task-list__button--primary"
                        type="button"
                        onClick={() => updateTask(getTaskId(task))}
                        disabled={activeTaskId === getTaskId(task)}
                      >
                        {activeTaskId === getTaskId(task) ? 'Saving...' : 'Save'}
                      </button>
                      <button className="task-list__button" type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="task-list__content">
                      <h2>{task.title}</h2>
                      <p>{task.description}</p>
                    </div>
                    <div className="task-list__actions">
                      <button className="task-list__button" type="button" onClick={() => startEdit(task)}>
                        Edit
                      </button>
                      <button
                        className="task-list__button task-list__button--danger"
                        type="button"
                        onClick={() => deleteTask(getTaskId(task))}
                        disabled={activeTaskId === getTaskId(task)}
                      >
                        {activeTaskId === getTaskId(task) ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

export default TaskList
