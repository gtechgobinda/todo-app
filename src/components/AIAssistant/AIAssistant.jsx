import React, { useState, useRef, useEffect } from 'react'
import api from '../../api/axiosConfig'
import './aiAssistant.css'

const AIAssistant = ({ tasks, onRefetch }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi! I can help you manage your tasks. Try saying:\n• "Add a task to review project specs"\n• "Delete the task about groceries"\n• "Edit the first task title to Buy milk"\n• "Suggest some tasks for today"',
    },
  ])
  const messagesEndRef = useRef(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isThinking])

  const addMessage = (role, text) => {
    setMessages((prev) => [...prev, { id: Date.now() + Math.random(), role, text }])
  }

  const executeAction = async (action) => {
    if (!action || action.type === 'none') return

    const { type, data } = action

    if (type === 'add_task') {
      await api.post('/add-task', { title: data.title, description: data.description })
    } else if (type === 'edit_task') {
      await api.put(`/tasks/${data.id}`, { title: data.title, description: data.description })
    } else if (type === 'delete_task') {
      await api.delete(`/tasks/${data.id}`)
    }

    await onRefetch()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!input.trim() || isThinking) return

    const userText = input.trim()
    setInput('')
    addMessage('user', userText)
    setIsThinking(true)

    try {
      const response = await api.post('/ai-chat', { message: userText, tasks })
      const { text, action } = response.data

      if (action && action.type !== 'none') {
        await executeAction(action)
      }

      addMessage('assistant', text)
    } catch (err) {
      addMessage('assistant', err.response?.data?.message || 'Sorry, something went wrong. Please try again.')
    } finally {
      setIsThinking(false)
    }
  }

  return (
    <div className="ai-assistant">
      {isOpen && (
        <section className="ai-assistant__panel">
          <div className="ai-assistant__header">
            <div>
              <h2>AI Assistant</h2>
              <p>Add, edit, delete, or get suggestions</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">
              ✕
            </button>
          </div>

          <div className="ai-assistant__messages">
            {messages.map((message) => (
              <p
                className={`ai-assistant__message ai-assistant__message--${message.role}`}
                key={message.id}
                style={{ whiteSpace: 'pre-line' }}
              >
                {message.text}
              </p>
            ))}
            {isThinking && (
              <p className="ai-assistant__message ai-assistant__message--assistant ai-assistant__message--thinking">
                Thinking...
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-assistant__form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask AI to manage your tasks..."
              disabled={isThinking}
            />
            <button type="submit" disabled={isThinking || !input.trim()}>
              Send
            </button>
          </form>
        </section>
      )}

      <button className="ai-assistant__toggle" type="button" onClick={() => setIsOpen((prev) => !prev)}>
        AI
      </button>
    </div>
  )
}

export default AIAssistant
