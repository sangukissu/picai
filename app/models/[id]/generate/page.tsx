import { Metadata } from 'next'
import { GenerateImageClient } from './generate-image-client'

export const metadata: Metadata = {
  title: 'Generate Image',
  description: 'Generate an image using your trained model',
}

export default function GenerateImage({
  params,
}: {
  params: { id: string }
}) {
  return <GenerateImageClient id={params.id} />
}

