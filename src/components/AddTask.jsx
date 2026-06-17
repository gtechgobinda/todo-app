import React from 'react'
import './addTask.css'

const AddTask = () => {
  return (
    <main className="add-task">
      <form className="add-task__form">
        <div className="add-task__header">
          <h1>Add New Task</h1>
          <p>Create a clear task with a short title and helpful description.</p>
        </div>

        <label className="add-task__field">
          <span>Title</span>
          <input type="text" placeholder="Enter task title" />
        </label>

        <label className="add-task__field">
          <span>Description</span>
          <textarea rows="5" placeholder="Write task details" />
        </label>

        <button className="add-task__button" type="submit">Add Task</button>
      </form>
    </main>
  )
}

export default AddTask
