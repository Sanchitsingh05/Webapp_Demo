import React, { useEffect, useState } from 'react'
 
const STORAGE_KEY = 'todo_dashboard_tasks_v1'
 
function defaultTasks() {
  return [
    { id: 1, title: 'Demo: Complete README', desc: 'Add README to repo', priority: 'High', tags: ['doc'], completed: false, due: '' },
    { id: 2, title: 'Demo: Create Dockerfile', desc: 'Add Dockerfile for app', priority: 'Medium', tags: ['devops'], completed: false, due: '' }
  ]
}
 
export default function App() {
  const [tasks, setTasks] = useState([])
  const [q, setQ] = useState('')
  const [filterTag, setFilterTag] = useState('')
  const [sortBy, setSortBy] = useState('priority')
  const [form, setForm] = useState({ title: '', desc: '', priority: 'Low', tags: '', due: '' })
  const [editingId, setEditingId] = useState(null)
 
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) setTasks(JSON.parse(raw))
    else setTasks(defaultTasks())
  }, [])
 
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])
 
  function addOrUpdate(e) {
    e.preventDefault()
    const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean)
    if (!form.title.trim()) return alert('Title required')
 
    if (editingId) {
      setTasks(ts => ts.map(t => (t.id === editingId ? { ...t, title: form.title, desc: form.desc, priority: form.priority, tags, due: form.due } : t)))
      setEditingId(null)
    } else {
      const id = Date.now()
      setTasks(ts => [{ id, title: form.title, desc: form.desc, priority: form.priority, tags, completed: false, due: form.due }, ...ts])
    }
    setForm({ title: '', desc: '', priority: 'Low', tags: '', due: '' })
  }
 
  function startEdit(t) {
    setEditingId(t.id)
    setForm({ title: t.title, desc: t.desc, priority: t.priority, tags: t.tags.join(', '), due: t.due || '' })
  }
 
  function toggleComplete(id) {
    setTasks(ts => ts.map(t => t.id === id ? { ...t, completed: !t.completed } : t))
  }
 
  function remove(id) {
    if (!confirm('Delete task?')) return
    setTasks(ts => ts.filter(t => t.id !== id))
  }
 
  const tags = Array.from(new Set(tasks.flatMap(t => t.tags)))
 
  const filtered = tasks.filter(t => {
    if (q && !(t.title + ' ' + t.desc).toLowerCase().includes(q.toLowerCase())) return false
    if (filterTag && !t.tags.includes(filterTag)) return false
    return true
  })
 
  const sorted = filtered.sort((a,b) => {
    if (sortBy === 'priority') {
      const order = { 'High': 0, 'Medium': 1, 'Low': 2 }
      return order[a.priority] - order[b.priority]
    }
    if (sortBy === 'due') {
      return (a.due || '9999-99-99').localeCompare(b.due || '9999-99-99')
    }
    return 0
  })
 
  return (
    <div className="min-h-screen p-6 bg-gray-50 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-bold mb-4">ToDo Dashboard</h1>
 
        <form onSubmit={addOrUpdate} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Title" />
          <input value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="Tags (comma-separated)" />
          <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})}>
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
          <input type="date" value={form.due} onChange={e => setForm({...form, due: e.target.value})} />
          <input value={form.desc} onChange={e => setForm({...form, desc: e.target.value})} placeholder="Description" />
          <div className="flex items-center gap-2">
            <button className="btn" type="submit">{editingId ? 'Update' : 'Add'}</button>
            {editingId && <button type="button" className="btn outline" onClick={() => { setEditingId(null); setForm({ title: '', desc: '', priority: 'Low', tags: '', due: '' }) }}>Cancel</button>}
          </div>
        </form>
 
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <input placeholder="Search..." value={q} onChange={e => setQ(e.target.value)} />
          <select value={filterTag} onChange={e => setFilterTag(e.target.value)}>
            <option value="">All tags</option>
            {tags.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="priority">Sort by priority</option>
            <option value="due">Sort by due date</option>
          </select>
          <button className="btn outline" onClick={() => { setTasks([]); localStorage.removeItem(STORAGE_KEY) }}>Clear All</button>
        </div>
 
        <ul className="space-y-3">
          {sorted.map(t => (
            <li key={t.id} className={`task ${t.completed ? 'completed' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" checked={t.completed} onChange={() => toggleComplete(t.id)} />
                    <strong>{t.title}</strong>
                    <span className="pill">{t.priority}</span>
                    {t.due && <small className="muted">Due: {t.due}</small>}
                  </div>
                  <div className="muted small">{t.desc}</div>
                  <div className="tags">
                    {t.tags.map(tag => <span key={tag} className="tag" onClick={() => setFilterTag(tag)}>{tag}</span>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button className="btn small" onClick={() => startEdit(t)}>Edit</button>
                  <button className="btn small outline" onClick={() => remove(t.id)}>Delete</button>
                </div>
              </div>
            </li>
          ))}
          {sorted.length === 0 && <li className="muted">No tasks match your filter</li>}
        </ul>
      </div>
    </div>
  )
}
