import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('tienda_user')) }
    catch { return null }
  })

  useEffect(() => {
    if (user) localStorage.setItem('tienda_user', JSON.stringify(user))
    else localStorage.removeItem('tienda_user')
  }, [user])

  function login(profile) {
    setUser({ name: profile.name, email: profile.email, picture: profile.picture, sub: profile.sub })
  }

  function logout() { setUser(null) }

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() { return useContext(AuthContext) }
