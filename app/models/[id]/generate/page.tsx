import { Metadata } from 'next'
import { GenerateImageClient } from './generate-image-client'

type Params = {
  id: string
}

type Props = {
  params: Params
  searchParams: { [key: string]: string | string[] | undefined }
}

export const metadata: Metadata = {
  title: 'Generate Image',
  description: 'Generate an image using your trained model',
}

export default function GenerateImage({ params }: Props) {
  return <GenerateImageClient id={params.id} />
}

