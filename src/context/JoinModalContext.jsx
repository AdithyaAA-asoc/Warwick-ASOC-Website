import { createContext, useContext, useState } from 'react'

const JoinModalContext = createContext(null)

export function JoinModalProvider({ children }) {
  const [open, setOpen] = useState(false)
  return (
    <JoinModalContext.Provider value={{ open, openModal: () => setOpen(true), closeModal: () => setOpen(false) }}>
      {children}
    </JoinModalContext.Provider>
  )
}

export function useJoinModal() {
  return useContext(JoinModalContext)
}
