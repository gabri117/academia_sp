import React from 'react'

interface ScrollXProps {
  children: React.ReactNode
  className?: string
}

const ScrollX: React.FC<ScrollXProps> = ({ children, className = '' }) => {
  return (
    <div className={`overflow-x-auto ${className}`}>
      {children}
    </div>
  )
}

export default ScrollX