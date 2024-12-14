import { ParsedUrlQuery } from 'querystring'

export interface Params extends ParsedUrlQuery {
  id: string
}

export type PageProps<P extends Params = Params> = {
  params: P
  searchParams?: { [key: string]: string | string[] | undefined }
}

