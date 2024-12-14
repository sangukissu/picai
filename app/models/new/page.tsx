'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2 } from 'lucide-react'
import { createAstriaModel } from '@/lib/astria-api'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default function NewModel() {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'man' | 'woman'>('man')
  const [images, setImages] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Check if user has enough credits
      const { data: credits, error: creditsError } = await supabase
        .rpc('get_user_credits')
      if (creditsError) throw creditsError
      
      if (!credits || credits[0].model_credits < 1) {
        toast({
          title: "Insufficient Credits",
          description: "You need 1 model credit to train a new model.",
          variant: "destructive",
        })
        return
      }

      // Create model in Astria API
      const astriaId = await createAstriaModel(title, type, images)

      // Save model to Supabase
      const { data: model, error: modelError } = await supabase
        .from('models')
        .insert({
          user_id: user.id,
          astria_id: astriaId,
          title,
          name: `ohwx ${type}`,
          status: 'training'
        })
        .select()
        .single()

      if (modelError) throw modelError

      // Deduct 1 model credit
      const { data: deductSuccess, error: deductError } = await supabase
        .rpc('deduct_credits', { 
          credit_type: 'model',
          amount: 1
        })

      if (deductError || !deductSuccess) throw new Error('Failed to deduct credits')

      toast({
        title: "Success",
        description: "Model creation started. You will be notified when training is complete.",
      })

      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating model:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create model. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Train New Model</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Model Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter a title for your model"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Model Type</Label>
              <Select value={type} onValueChange={(value: 'man' | 'woman') => setType(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select model type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="man">Man</SelectItem>
                  <SelectItem value="woman">Woman</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Training Images</Label>
              <Input
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setImages(Array.from(e.target.files || []))}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Training...
                </>
              ) : (
                'Train Model'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

