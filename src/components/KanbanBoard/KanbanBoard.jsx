import React, { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import api from '../../api/axiosConfig'
import './kanban.css'

const COLUMNS = [
  { id: 'todo', label: 'To Do', accent: '#6366f1' },
  { id: 'in-progress', label: 'In Progress', accent: '#f59e0b' },
  { id: 'done', label: 'Done', accent: '#22c55e' },
]

function TaskCard({ task, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id: task._id, data: { task } })

  return (
    <article
      ref={setNodeRef}
      className={`kanban-card${isDragging ? ' kanban-card--dragging' : ''}`}
      style={{ transform: CSS.Transform.toString(transform) }}
      {...attributes}
    >
      <button
        ref={setActivatorNodeRef}
        className="kanban-card__handle"
        type="button"
        aria-label="Drag to move"
        {...listeners}
      >
        ⠿
      </button>
      <div className="kanban-card__body">
        <h3 className="kanban-card__title">{task.title}</h3>
        <p className="kanban-card__desc">{task.description}</p>
      </div>
      <div className="kanban-card__actions">
        <button className="kanban-card__btn" type="button" onClick={() => onEdit(task)}>
          Edit
        </button>
        <button
          className="kanban-card__btn kanban-card__btn--danger"
          type="button"
          onClick={() => onDelete(task._id)}
        >
          ✕
        </button>
      </div>
    </article>
  )
}

function CardOverlay({ task }) {
  return (
    <article className="kanban-card kanban-card--overlay">
      <span className="kanban-card__handle">⠿</span>
      <div className="kanban-card__body">
        <h3 className="kanban-card__title">{task.title}</h3>
        <p className="kanban-card__desc">{task.description}</p>
      </div>
    </article>
  )
}

function Column({ column, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })

  return (
    <div
      ref={setNodeRef}
      className={`kanban-column${isOver ? ' kanban-column--over' : ''}`}
      style={{ '--accent': column.accent }}
    >
      <header className="kanban-column__header">
        <span className="kanban-column__dot" />
        <h2 className="kanban-column__title">{column.label}</h2>
        <span className="kanban-column__count">{tasks.length}</span>
      </header>
      <div className="kanban-column__body">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <p className="kanban-column__empty">Drop tasks here</p>
        )}
      </div>
    </div>
  )
}

function EditModal({ task, onClose, onSave }) {
  const [form, setForm] = useState({
    title: task.title || '',
    description: task.description || '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setError('Both fields are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSave(task._id, { title: form.title.trim(), description: form.description.trim() })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save.')
      setSaving(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="kanban-modal__backdrop" onClick={onClose} onKeyDown={handleKey}>
      <div className="kanban-modal" onClick={(e) => e.stopPropagation()}>
        <div className="kanban-modal__header">
          <h2>Edit Task</h2>
          <button type="button" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <label className="kanban-modal__field">
          <span>Title</span>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            autoFocus
          />
        </label>
        <label className="kanban-modal__field">
          <span>Description</span>
          <textarea
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            rows={4}
          />
        </label>
        {error && <p className="kanban-modal__error">{error}</p>}
        <div className="kanban-modal__actions">
          <button
            className="kanban-modal__btn kanban-modal__btn--primary"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button className="kanban-modal__btn" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function KanbanBoard({ tasks, setTasks, isLoading, error }) {
  const [activeTask, setActiveTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [actionError, setActionError] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  const getTasksByStatus = (status) =>
    tasks.filter((t) => (t.status || 'todo') === status)

  const handleDragStart = ({ active }) => {
    setActiveTask(active.data.current?.task ?? null)
    setActionError('')
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const taskId = active.id
    const newStatus = over.id
    const task = tasks.find((t) => t._id === taskId)

    if (!task || (task.status || 'todo') === newStatus) return
    if (!COLUMNS.some((c) => c.id === newStatus)) return

    // Optimistic update — move card immediately
    const snapshot = [...tasks]
    setTasks((prev) =>
      prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
    )

    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus })
    } catch {
      // Rollback on API failure
      setTasks(snapshot)
      setActionError('Failed to move task. Please try again.')
    }
  }

  const handleEditSave = async (taskId, form) => {
    await api.put(`/tasks/${taskId}`, form)
    setTasks((prev) => prev.map((t) => (t._id === taskId ? { ...t, ...form } : t)))
    setEditingTask(null)
  }

  const handleDelete = async (taskId) => {
    setActionError('')
    // Optimistic delete — remove immediately, restore on failure
    const snapshot = [...tasks]
    setTasks((prev) => prev.filter((t) => t._id !== taskId))
    try {
      await api.delete(`/tasks/${taskId}`)
    } catch {
      setTasks(snapshot)
      setActionError('Failed to delete task. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <main className="kanban">
        <p className="kanban__state">Loading tasks...</p>
      </main>
    )
  }

  if (error) {
    return (
      <main className="kanban">
        <p className="kanban__state kanban__state--error">{error}</p>
      </main>
    )
  }

  return (
    <main className="kanban">
      <div className="kanban__header">
        <h1>Kanban Board</h1>
        <p>Drag cards between columns to update their status.</p>
      </div>

      {actionError && (
        <p className="kanban__state kanban__state--error">{actionError}</p>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="kanban__columns">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              column={col}
              tasks={getTasksByStatus(col.id)}
              onEdit={setEditingTask}
              onDelete={handleDelete}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeTask ? <CardOverlay task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {editingTask && (
        <EditModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSave={handleEditSave}
        />
      )}
    </main>
  )
}
