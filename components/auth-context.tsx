"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type UserRole = "user" | "admin" | "super_admin"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for demonstration
const MOCK_USERS: (User & { password: string })[] = [
  {
    id: "1",
    name: "Juan Cajero",
    email: "cajero@pos.com",
    password: "123456",
    role: "user",
    isActive: true,
  },
  {
    id: "2",
    name: "María Admin",
    email: "admin@pos.com",
    password: "admin123",
    role: "admin",
    isActive: true,
  },
  {
    id: "3",
    name: "Carlos SuperAdmin",
    email: "super@pos.com",
    password: "super123",
    role: "super_admin",
    isActive: true,
  },
]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem("pos_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = MOCK_USERS.find((u) => u.email === email && u.password === password && u.isActive)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("pos_user", JSON.stringify(userWithoutPassword))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("pos_user")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function hasPermission(userRole: UserRole, requiredRole: UserRole): boolean {
  const roleHierarchy = { user: 1, admin: 2, super_admin: 3 }
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole]
}
