import * as React from 'react'
import { Toaster as Sonner } from 'sonner'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      closeButton={true}
      duration={4000}
      expand={true}
      position="top-right"
      richColors={true}
      toastOptions={{
        classNames: {
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:rounded-md group-[.toast]:font-semibold',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:rounded-md',
          closeButton:
            'group-[.toast]:bg-background group-[.toast]:text-foreground group-[.toast]:border-border group-[.toast]:hover:bg-muted',
          description:
            'group-[.toast]:text-muted-foreground group-[.toast]:text-sm group-[.toast]:mt-1',
          error:
            'group-[.toaster]:bg-red-50 group-[.toaster]:text-red-900 group-[.toaster]:border-red-200',
          info: 'group-[.toaster]:bg-blue-50 group-[.toaster]:text-blue-900 group-[.toaster]:border-blue-200',
          success:
            'group-[.toaster]:bg-green-50 group-[.toaster]:text-green-900 group-[.toaster]:border-green-200',
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-xl group-[.toaster]:border-2 group-[.toaster]:rounded-lg group-[.toaster]:p-4 group-[.toaster]:min-h-[60px] group-[.toaster]:text-base group-[.toaster]:font-medium',
          warning:
            'group-[.toaster]:bg-yellow-50 group-[.toaster]:text-yellow-900 group-[.toaster]:border-yellow-200',
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
