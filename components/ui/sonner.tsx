'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      style={
        {
          '--normal-bg': '#E8C547',
          '--normal-text': '#0A1A2F',
          '--normal-border': '#D4AF37',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
