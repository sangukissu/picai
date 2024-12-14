import { ParsedUrlQuery } from 'querystring'

declare module 'next' {
  export type PageProps<P = {}, IP = P> = {
    params?: P
    searchParams?: { [key: string]: string | string[] }
  }
}

declare module 'next/types' {
  export type PageProps<P = {}, IP = P> = {
    params?: P
    searchParams?: { [key: string]: string | string[] }
  }
}

