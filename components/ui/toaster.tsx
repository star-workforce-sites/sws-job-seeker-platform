'use client'

import { useToast } from '@/hooks/use-toast'
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast'

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props} className="bg-[#E8C547] border-2 border-[#D4AF37] text-[#0A1A2F] rounded-full shadow-lg">
            <div className="grid gap-1">
              <ToastTitle className="font-extrabold text-[#0A1A2F]">Career Accel Says:</ToastTitle>
              {title && <ToastTitle className="font-bold text-[#0A1A2F]">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-[#0A1A2F]/80">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose className="text-[#0A1A2F] hover:text-[#0A1A2F]/70" />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
