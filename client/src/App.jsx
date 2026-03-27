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

function App() {
  // Execute the query to fetch persons
  const { loading, error, data } = useQuery(ALL_PERSONS)
  
  // Setup the mutation to add a new person
  // We use refetchQueries to automatically update the UI after a successful save
  const [addPerson] = useMutation(ADD_PERSON, {
    refetchQueries: [{ query: ALL_PERSONS }]
  })

  // Local state for the "Add Person" form fields
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')

  /**
   * Handles the form submission to save a new person.
   */
  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addPerson({ variables: { name, phone, street, city } })
      // Reset form fields on success
      setName('')
      setPhone('')
      setStreet('')
      setCity('')
      console.log('✅ Person added successfully')
    } catch (err) {
      console.error("❌ Error adding person:", err.message)
      alert("Error: " + err.message)
    }
  }

  // Handle loading and error states for the initial data fetch
  if (loading) return <div className="loading">Checking data...</div>
  if (error) return <div className="error">Oops! {error.message}</div>

  return (
    <div className="container">
      <header>
        <h1>GraphQL Explorer</h1>
        <p className="subtitle">Manage person data with real-time Apollo Client sync</p>
      </header>

      <main className="grid">
        {/* Left Column: Form to add new persons */}
        <section className="form-section">
          <div className="glass-card">
            <h3>Register New Person</h3>
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
              <button type="submit" className="btn-primary">Save to Database</button>
            </form>
          </div>
        </section>

        {/* Right Column: Dynamic list of persons */}
        <section className="list-section">
          <h3>Current Directory</h3>
          <div className="person-list">
            {data && data.allPersons && data.allPersons.map(p => (
              <article key={p.id} className="glass-card person-item">
                <div className="person-header">
                  <h4>{p.name}</h4>
                  <span className="id-badge">#{String(p.id).slice(0, 4)}</span>
                </div>
                <div className="person-details">
                  <p><span>📞 Phone:</span> {p.phone || 'N/A'}</p>
                  <p><span>📍 Address:</span> {p.address ? `${p.address.street}, ${p.address.city}` : 'No address provided'}</p>
                </div>
              </article>
            ))}
            {data?.allPersons?.length === 0 && <p className="empty-msg">No persons found in the database.</p>}
          </div>
        </section>
      </main>

      <footer>
        <p>Built with Apollo Client & Vite • Functional & Styled</p>
      </footer>
    </div>
  )
}

export default App
