import React, { useState } from 'react'
import './aiAssistant.css'

const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: 'Hi, I can help you create and manage todos.',
    },
  ])

  const handleSubmit = (event) => {
    event.preventDefault()

    if (!input.trim()) {
      return
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: input.trim(),
    }

    const assistantMessage = {
      id: Date.now() + 1,
      role: 'assistant',
      text: 'Got it. Next step is connecting this message to your backend AI API.',
    }

    setMessages((prevMessages) => [...prevMessages, userMessage, assistantMessage])
    setInput('')
  }

  return (
    <div className="ai-assistant">
      {isOpen && (
        <section className="ai-assistant__panel">
          <div className="ai-assistant__header">
            <div>
              <h2>AI Assistant</h2>
              <p>Todo helper</p>
            </div>
            <button type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">
              x
            </button>
          </div>

          <div className="ai-assistant__messages">
            {messages.map((message) => (
              <p
                className={`ai-assistant__message ai-assistant__message--${message.role}`}
                key={message.id}
              >
                {message.text}
              </p>
            ))}
          </div>

          <form className="ai-assistant__form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask AI to add a task..."
            />
            <button type="submit">Send</button>
          </form>
        </section>
      )}

      <button className="ai-assistant__toggle" type="button" onClick={() => setIsOpen(true)}>
        AI
      </button>
    </div>
  )
}

export default AIAssistant
