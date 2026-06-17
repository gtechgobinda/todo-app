import React from 'react'
import { Link } from 'react-router-dom'
import './navbar.css'

const NavBar = () => {
  return (
    <nav className="navbar">
      <div className="navbar__brand">To Do App</div>
      <ul className="navbar__links">
        <li><Link className="navbar__link" to="/">List</Link></li>
        <li><Link className="navbar__link navbar__link--primary" to="/add">Add Task</Link></li>
      </ul>
    </nav>
  )
}

export default NavBar
