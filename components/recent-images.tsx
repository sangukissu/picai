'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export function RecentImages() {
  const [images, setImages] = useState<{ id: string, url: string }[]>([])

  useEffect(() => {
    async function fetchRecentImages() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data, error } = await supabase
          .from('images')
          .select('id, url')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(4)

        if (error) {
          console.error('Error fetching recent images:', error)
          return
        }
        setImages(data)
      }
    }

    fetchRecentImages()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Images</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {images.map((image) => (
            <div key={image.id} className="relative aspect-square">
              <Image
                src={image.url}
                alt="Generated image"
                layout="fill"
                objectFit="cover"
                className="rounded-md"
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

