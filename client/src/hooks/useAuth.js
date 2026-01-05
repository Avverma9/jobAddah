import { useState } from 'react'

export default function useAuth() {
  const [user, setUser] = useState(null)

  return {
    user,
    login: async () => setUser({ name: 'Demo' }),
    logout: () => setUser(null),
  }
}
