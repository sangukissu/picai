import { Metadata } from 'next'
import { GenerateImageClient } from './generate-image-client'
import { PageProps, Params } from '@/app/types'

export const metadata: Metadata = {
  title: 'Generate Image',
  description: 'Generate an image using your trained model',
}

export default function GenerateImage({ params }: PageProps<Params>) {
  return <GenerateImageClient id={params.id} />
}

