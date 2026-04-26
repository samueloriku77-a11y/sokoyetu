/* Navigation component stub for all dashboards */
export default function Navigation({ role, user, onLogout }) {
  return (
    <nav className="app-nav">
      <div className="nav-brand">SokoYetu</div>
      <div className="nav-user">
        <span>{user?.name}</span>
        <button onClick={onLogout}>Logout</button>
      </div>
    </nav>
  )
}
