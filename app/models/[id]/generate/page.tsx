import { Metadata } from 'next'
import { GenerateImageClient } from './generate-image-client'

type GenerateImageProps = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

export const metadata: Metadata = {
  title: 'Generate Image',
  description: 'Generate an image using your trained model',
}

export default function GenerateImage({ params }: GenerateImageProps) {
  return <GenerateImageClient id={params.id} />
}

