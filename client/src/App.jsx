import { useState } from 'react'
import { useQuery, useMutation, gql } from '@apollo/client'

/**
 * GraphQL Query to fetch all persons from the server.
 * Returns an array of person objects with their internal details.
 */
const ALL_PERSONS = gql`
  query {
    allPersons {
      id
      name
      phone
      address {
        street
        city
      }
    }
  }
`

/**
 * GraphQL Mutation to add a new person to the server.
 * Takes name, street, city, and optional phone as variables.
 */
const ADD_PERSON = gql`
  mutation addPerson($name: String!, $street: String!, $city: String!, $phone: String) {
    addPerson(name: $name, street: $street, city: $city, phone: $phone) {
      id
      name
    }
  }
`

/**
 * GraphQL Mutation to update an existing person record.
 * Supports updating all fields (name, phone, street, city).
 */
const UPDATE_PERSON = gql`
  mutation updatePerson($id: ID!, $name: String, $phone: String, $street: String, $city: String) {
    updatePerson(id: $id, name: $name, phone: $phone, street: $street, city: $city) {
      id
      name
      phone
      address {
        street
        city
      }
    }
  }
`

/**
 * GraphQL Mutation to delete a person by ID.
 */
const DELETE_PERSON = gql`
  mutation deletePerson($id: ID!) {
    deletePerson(id: $id) {
      id
    }
  }
`

function App() {
  // Execute the query to fetch persons
  const { loading, error, data } = useQuery(ALL_PERSONS)
  
  // Mutations
  const [addPerson] = useMutation(ADD_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }]
  })

  const [updatePerson] = useMutation(UPDATE_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }]
  })

  const [deletePerson] = useMutation(DELETE_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }]
  })

  // Local state for the form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  // UI state for editing
  const [editMode, setEditMode] = useState(false)
  const [editingId, setEditingId] = useState(null)

  /**
   * Handles deleting a person with a confirmation prompt.
   */
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await deletePerson({ variables: { id } })
        console.log('🗑️ Person deleted successfully')
      } catch (err) {
        console.error("❌ Error deleting:", err.message)
        alert("Error deleting person")
      }
    }
  }

  /**
   * Populate the form to begin editing a person.
   */
  const startEdit = (person) => {
    setEditMode(true)
    setEditingId(person.id)
    setName(person.name)
    setPhone(person.phone || '')
    setStreet(person.address?.street || '')
    setCity(person.address?.city || '')
    
    // Scroll to form for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Reset form and exit edit mode.
   */
  const cancelEdit = () => {
    setEditMode(false)
    setEditingId(null)
    setName('')
    setPhone('')
    setStreet('')
    setCity('')
  }

  /**
   * Handles the form submission (Add or Update).
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editMode) {
        // Update existing person with all fields
        await updatePerson({ 
          variables: { id: editingId, name, phone, street, city } 
        })
        console.log('✅ Person updated successfully')
      } else {
        // Create new person
        await addPerson({ variables: { name, phone, street, city } })
        console.log('✅ Person added successfully')
      }
      cancelEdit()
    } catch (err) {
      console.error("❌ Error:", err.message)
      alert("Error: " + err.message)
    }
  }

  if (loading) return <div className="loading">Checking data...</div>
  if (error) return <div className="error">Oops! {error.message}</div>

  return (
    <div className="container">
      <header>
        <h1>GraphQL Explorer</h1>
        <p className="subtitle">Manage person data with real-time Apollo Client sync</p>
      </header>

      <main className="grid">
        <section className="form-section">
          <div className="glass-card">
            <h3>{editMode ? `Edit ${name}` : 'Register New Person'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  placeholder="John Doe" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  placeholder="+1 234 567 890" 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Street Address</label>
                <input 
                  placeholder="123 Main St" 
                  value={street} 
                  onChange={e => setStreet(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input 
                  placeholder="New York" 
                  value={city} 
                  onChange={e => setCity(e.target.value)} 
                  required 
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn-primary">
                  {editMode ? 'Update Record' : 'Save to Database'}
                </button>
                {editMode && (
                  <button type="button" onClick={cancelEdit} className="btn-secondary">
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </section>

        <section className="list-section">
          <h3>Current Directory</h3>
          <div className="person-list">
            {data && data.allPersons && data.allPersons.map(p => (
              <article key={p.id} className="glass-card person-item">
                <div className="person-header">
                  <h4>{p.name}</h4>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <button onClick={() => startEdit(p)} className="btn-icon">Edit</button>
                    <button onClick={() => handleDelete(p.id, p.name)} className="btn-icon btn-danger">Delete</button>
                    <span className="id-badge">#{String(p.id).slice(0, 4)}</span>
                  </div>
                </div>
                <div className="person-details">
                  <p><span>📞 Phone:</span> {p.phone || 'N/A'}</p>
                  <p><span>📍 Address:</span> {p.address ? `${p.address.street}, ${p.address.city}` : 'No address'}</p>
                </div>
              </article>
            ))}
            {data?.allPersons?.length === 0 && <p className="empty-msg">No persons found.</p>}
          </div>
        </section>
      </main>

      <footer>
        <p>Built with Apollo Client & Vite • CRUD Enabled</p>
      </footer>
    </div>
  )
}

export default App
