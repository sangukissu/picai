import type { Metadata } from "next"
import { GenerateImageClient } from "./generate-image-client"

export const metadata: Metadata = {
  title: "Generate Image",
  description: "Generate an image using your trained model",
}

interface GenerateImageProps {
  params: { id: string }
}

export default function GenerateImage({ params }: GenerateImageProps) {
  return <GenerateImageClient id={params.id} />
}

