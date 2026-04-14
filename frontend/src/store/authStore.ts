import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Usuario, Empresa, Trabajador } from '@/types'

interface AuthState {
  user: Usuario | null
  empresa: Empresa | null
  trabajador: Trabajador | null
  isLoading: boolean
  setUser: (user: Usuario | null) => void
  setEmpresa: (empresa: Empresa | null) => void
  setTrabajador: (trabajador: Trabajador | null) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      empresa: null,
      trabajador: null,
      isLoading: true,
      setUser: (user) => set({ user }),
      setEmpresa: (empresa) => set({ empresa }),
      setTrabajador: (trabajador) => set({ trabajador }),
      logout: () => set({ user: null, empresa: null, trabajador: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
)