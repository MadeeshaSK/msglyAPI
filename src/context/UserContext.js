'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'

const UserContext = createContext()

export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from your backend
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/get-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
              firebaseUid: firebaseUser.uid,
              email: firebaseUser.email 
            })
          })
          
          if (response.ok) {
            const data = await response.json()
            setUser({
              id: data.data.id,
              firebaseUid: firebaseUser.uid,
              name: data.data.name,
              email: data.data.email,
              phone: data.data.phone,
              role: 'user',
              apiKey: data.data.apiKey,
              amount: data.data.amount,
              validity: data.data.validity
            })
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error('Error fetching user data:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}