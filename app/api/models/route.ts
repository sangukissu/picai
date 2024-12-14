import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

const ASTRIA_API_KEY = process.env.ASTRIA_API_KEY
const ASTRIA_API_URL = 'https://api.astria.ai/tunes'

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data: models, error } = await supabase
      .from('models')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(models)
  } catch (error) {
    console.error('Error fetching models:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })
  
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { title, name, branch, images } = body

    // Create model in Astria API
    const astriaResponse = await fetch(ASTRIA_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ASTRIA_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tune: { title, name, branch, image_urls: images }
      }),
    })

    if (!astriaResponse.ok) {
      throw new Error('Failed to create model in Astria API')
    }

    const astriaData = await astriaResponse.json()

    // Store model information in Supabase
    const { data: model, error } = await supabase
      .from('models')
      .insert({
        user_id: session.user.id,
        astria_id: astriaData.id,
        title,
        name,
        branch,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(model)
  } catch (error) {
    console.error('Error creating model:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

