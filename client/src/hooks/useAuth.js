import { useState, useEffect } from 'react'

export default function useAuth() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    // placeholder: restore user from localStorage or cookie
    setUser(null)
  }, [])

  return {
    user,
    login: async () => setUser({ name: 'Demo' }),
    logout: () => setUser(null),
  }
}
