import { NextResponse } from 'next/server'

const API_KEY = process.env.ASTRIA_API_KEY
const API_URL = 'https://api.astria.ai/tunes'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tuneId, prompt, negativePrompt, numImages } = body

    const response = await fetch(`${API_URL}/${tuneId}/prompts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          text: prompt,
          negative_prompt: negativePrompt,
          num_images: numImages,
        },
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to generate images')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating images:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

