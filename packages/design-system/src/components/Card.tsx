import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'default' | 'elevated' | 'outlined'
}

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
  return (
    <div
      className={`card ${variant !== 'default' ? `card--${variant}` : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}
