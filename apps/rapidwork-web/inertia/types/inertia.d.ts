export interface SharedProps {
  user?: User
}

export interface User {
  createdAt: string
  email: string
  id: number
  name: string
  updatedAt: string
}

declare module '@inertiajs/core' {
  interface PageProps extends SharedProps {}
}
