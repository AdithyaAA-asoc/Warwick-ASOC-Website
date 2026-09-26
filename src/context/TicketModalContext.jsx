import { createContext, useContext, useState } from 'react'

const TicketModalContext = createContext(null)

export function TicketModalProvider({ children }) {
  const [event, setEvent] = useState(null)

  return (
    <TicketModalContext.Provider
      value={{
        event,
        openTicketModal: (evt) => setEvent(evt),
        closeTicketModal: () => setEvent(null),
      }}
    >
      {children}
    </TicketModalContext.Provider>
  )
}

const NOOP_MODAL = { openTicketModal: () => {}, closeTicketModal: () => {}, event: null }

export function useTicketModal() {
  return useContext(TicketModalContext) ?? NOOP_MODAL
}
