import 'next/types/global'

declare module 'next/types/global' {
  export interface PageProps {
    params?: any
    searchParams?: any
  }
}

