// frontend/src/pages/Community.jsx
import { useState, useEffect } from 'react'
import apiClient from '../api/client'
import './Community.css'

const POST_TYPES = [
  ['produce_listing', 'Produce Listing'],
  ['buy_request', 'Buy Request'],
  ['notice', 'Notice'],
  ['tip', 'Tip'],
  ['question', 'Question'],
]

const emptyForm = {
  post_type: 'produce_listing',
  title: '',
  body: '',
  county: '',
  contact_info: '',
  price_kes: '',
}

export default function Community() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [filters, setFilters] = useState({
    post_type: '',
    county: '',
    search: '',
  })

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.post_type) params.post_type = filters.post_type
      if (filters.county.trim()) params.county = filters.county.trim()
      if (filters.search.trim()) params.search = filters.search.trim()

      const res = await apiClient.get('community/posts/', { params })
      setPosts(res.data)
    } catch (err) {
      setError('Could not load community posts.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [filters.post_type, filters.county, filters.search])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        post_type: formData.post_type,
        title: formData.title,
        body: formData.body,
        county: formData.county,
        contact_info: formData.contact_info,
      }
      if (formData.price_kes !== '') {
        payload.price_kes = formData.price_kes
      }
      await apiClient.post('community/posts/', payload)
      setFormData(emptyForm)
      setShowForm(false)
      fetchPosts()
    } catch (err) {
      setError('Could not create post. Check the fields and try again.')
    }
  }

  const typeLabel = (value) =>
    POST_TYPES.find(([v]) => v === value)?.[1] || value

  const formatDate = (iso) => {
    if (!iso) return ''
    return new Date(iso).toLocaleDateString()
  }

  return (
    <div className="community-container">
      <div className="community-header">
        <h1>Community</h1>
        <button onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : 'Create Post'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="community-form">
          <select name="post_type" value={formData.post_type} onChange={handleChange}>
            {POST_TYPES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            type="text"
            name="title"
            placeholder="Title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          <textarea
            name="body"
            placeholder="Write your post..."
            value={formData.body}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="county"
            placeholder="County (e.g. Nakuru)"
            value={formData.county}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="contact_info"
            placeholder="Contact information"
            value={formData.contact_info}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            step="0.01"
            name="price_kes"
            placeholder="Price (KES, optional)"
            value={formData.price_kes}
            onChange={handleChange}
          />
          {error && <p className="community-error">{error}</p>}
          <button type="submit">Publish Post</button>
        </form>
      )}

      <div className="community-filters">
        <select
          name="post_type"
          value={filters.post_type}
          onChange={handleFilterChange}
        >
          <option value="">All types</option>
          {POST_TYPES.map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <input
          type="text"
          name="county"
          placeholder="Filter by county"
          value={filters.county}
          onChange={handleFilterChange}
        />
        <input
          type="text"
          name="search"
          placeholder="Search posts"
          value={filters.search}
          onChange={handleFilterChange}
        />
      </div>

      {error && !showForm && <p className="community-error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : posts.length === 0 ? (
        <p>No community posts yet.</p>
      ) : (
        <div className="community-list">
          {posts.map((post) => (
            <div key={post.id} className="community-card">
              <span className="community-type">{typeLabel(post.post_type)}</span>
              <h3>{post.title}</h3>
              <p className="community-body">{post.body}</p>
              <p>County: {post.county}</p>
              <p>Contact: {post.contact_info}</p>
              {post.price_kes != null && post.price_kes !== '' && (
                <p>Price: KES {post.price_kes}</p>
              )}
              <p className="community-meta">
                Author ID: {post.author_name}
              </p>
              <p className="community-meta">Posted: {formatDate(post.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
