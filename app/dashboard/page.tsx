'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'
import { getAstriaModelStatus, generateAstriaImage } from '@/lib/astria-api'
import { Input } from '@/components/ui/input'
import Image from 'next/image'

interface Credits {
  model_credits: number
  image_credits: number
}

interface Model {
  id: number
  astria_id: string
  title: string
  name: string
  status: string
}

interface Image {
  id: number
  url: string
  prompt: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [credits, setCredits] = useState<Credits | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [images, setImages] = useState<Image[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedModel, setSelectedModel] = useState<Model | null>(null)
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        
        // Get user
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) {
          router.push('/auth/signin')
          return
        }
        setUser(user)

        // Get credits
        const { data: creditsData, error: creditsError } = await supabase
          .from('users_credits')
          .select('model_credits, image_credits')
          .eq('user_id', user.id)
          .single()

        if (creditsError) throw creditsError
        setCredits(creditsData)

        // Get models
        const { data: modelsData, error: modelsError } = await supabase
          .from('models')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (modelsError) throw modelsError
        setModels(modelsData || [])

        // Update model statuses
        for (const model of modelsData || []) {
          if (model.status === 'training') {
            const status = await getAstriaModelStatus(model.astria_id)
            if (status !== model.status) {
              await supabase
                .from('models')
                .update({ status })
                .eq('id', model.id)
              setModels(prev => prev.map(m => m.id === model.id ? { ...m, status } : m))
            }
          }
        }

        // Get images
        const { data: imagesData, error: imagesError } = await supabase
          .from('images')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (imagesError) throw imagesError
        setImages(imagesData || [])

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [router, supabase, toast])

  const handleGenerateImage = async () => {
    if (!selectedModel || !prompt) return

    setIsGenerating(true)
    try {
      // Check credits
      if (!credits || credits.image_credits < 0.2) {
        toast({
          title: "Insufficient Credits",
          description: "You need 0.2 image credits to generate an image.",
          variant: "destructive",
        })
        return
      }

      // Generate image
      const imageUrl = await generateAstriaImage(selectedModel.astria_id, prompt)

      // Save image to Supabase
      const { data: image, error: imageError } = await supabase
        .from('images')
        .insert({
          user_id: user?.id,
          model_id: selectedModel.id,
          url: imageUrl,
          prompt
        })
        .select()
        .single()

      if (imageError) throw imageError

      // Deduct credits
      const { error: deductError } = await supabase
        .rpc('deduct_credits', { 
          credit_type: 'image',
          amount: 0.2
        })

      if (deductError) throw deductError

      setImages(prev => [image, ...prev])
      setCredits(prev => prev ? { ...prev, image_credits: prev.image_credits - 0.2 } : null)

      toast({
        title: "Success",
        description: "Image generated successfully.",
      })
    } catch (error) {
      console.error('Error generating image:', error)
      toast({
        title: "Error",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Credits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p>Model Credits: {credits?.model_credits.toFixed(1) ?? 'Loading...'}</p>
              <p>Image Credits: {credits?.image_credits.toFixed(1) ?? 'Loading...'}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Models</CardTitle>
          </CardHeader>
          <CardContent>
            {models.length > 0 ? (
              <div className="space-y-4">
                {models.map((model) => (
                  <div key={model.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{model.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Status: {model.status}
                      </p>
                    </div>
                    <Button
                      onClick={() => setSelectedModel(model)}
                      disabled={model.status !== 'succeeded'}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                You haven&apos;t created any models yet.
              </p>
            )}
          </CardContent>
        </Card>

        {selectedModel && (
          <Card>
            <CardHeader>
              <CardTitle>Generate Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Selected Model: {selectedModel.title}</p>
                <Input
                  placeholder="Enter your prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                />
                <Button
                  onClick={handleGenerateImage}
                  disabled={isGenerating || !prompt}
                >
                  {isGenerating ? 'Generating...' : 'Generate Image'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Your Images</CardTitle>
          </CardHeader>
          <CardContent>
            {images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative aspect-square">
                    <Image
                      src={image.url}
                      alt={image.prompt}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg"
                    />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                You haven&apos;t generated any images yet.
              </p>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button asChild>
            <Link href="/models/new">
              Train New Model
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

