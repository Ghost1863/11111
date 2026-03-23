'use client'

import React, { createContext, useContext, useRef } from 'react'

type RefContextValue = {
  headerLogoRef: React.RefObject<HTMLAnchorElement | null>
  afterHeroSectionRef: React.RefObject<HTMLDivElement | null>
}
const RefContext = createContext<RefContextValue>({
  headerLogoRef: React.createRef<HTMLAnchorElement>(),
  afterHeroSectionRef: React.createRef<HTMLDivElement>()
})

export function RefContextProvider({ children }: { children: React.ReactNode }) {
  const headerLogoRef = useRef<HTMLAnchorElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  return (
    <RefContext.Provider value={{
      headerLogoRef: headerLogoRef,
      afterHeroSectionRef: linksRef
    }}>
      {children}
    </RefContext.Provider>
  )
}

export default RefContext

export function useRefContext() {
  const ctx = useContext(RefContext)
  if (!ctx) {
    throw new Error('useRefContext must be used within <RefContextProvider>')
  }
  return ctx
}