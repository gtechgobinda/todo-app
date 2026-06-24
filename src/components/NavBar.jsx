import React from 'react'
import { Link } from 'react-router-dom'
import './navbar.css'

const NavBar = ({ user, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="navbar__brand">To Do App</div>
      <ul className="navbar__links">
        <li><Link className="navbar__link" to="/">Board</Link></li>
        <li><Link className="navbar__link navbar__link--primary" to="/add">Add Task</Link></li>
        {user && (
          <>
            <li><span className="navbar__user">{user}</span></li>
            <li>
              <button className="navbar__link navbar__link--logout" onClick={onLogout}>
                Logout
              </button>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}

export default NavBar
