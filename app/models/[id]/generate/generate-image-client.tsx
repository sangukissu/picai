"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { generateAstriaImage, getAstriaModelStatus } from "@/lib/astria-api"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface Model {
  id: number
  astria_id: string
  title: string
}

interface GenerateImageClientProps {
  id: string
}

export function GenerateImageClient({ id }: GenerateImageClientProps) {
  const [model, setModel] = useState<Model | null>(null)
  const [prompt, setPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  useEffect(() => {
    const fetchModel = async () => {
      try {
        const { data, error } = await supabase.from("models").select("*").eq("id", id).single()

        if (error) throw error

        if (data) {
          setModel(data)
          // Check if the model is ready
          const status = await getAstriaModelStatus(data.astria_id)
          if (status !== "succeeded") {
            throw new Error("Model not ready")
          }
        } else {
          throw new Error("Model not found")
        }
      } catch (error) {
        console.error("Error fetching model:", error)
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "An error occurred",
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    }

    fetchModel()
  }, [id, router, supabase, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")
      if (!model) throw new Error("Model not found")

      // Check if user has enough credits
      const { data: credits, error: creditsError } = await supabase.rpc("get_user_credits")
      if (creditsError) throw creditsError

      if (!credits || credits < 0.2) {
        throw new Error("Insufficient credits")
      }

      // Generate image using Astria API
      const imageUrl = await generateAstriaImage(model.astria_id, prompt)

      // Save generated image to Supabase
      const { error: insertError } = await supabase.from("images").insert({
        user_id: user.id,
        model_id: model.id,
        prompt: prompt,
        url: imageUrl,
      })

      if (insertError) throw insertError

      // Deduct 0.2 image credits
      const { data: deductSuccess, error: deductError } = await supabase.rpc("deduct_credits", {
        credit_type: "image",
        amount: 0.2,
      })

      if (deductError || !deductSuccess) throw new Error("Failed to deduct credits")

      setGeneratedImage(imageUrl)
      toast({
        title: "Image Generated",
        description: "Your image has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating image:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!model) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Generate Image for {model.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                type="text"
                placeholder="Enter your prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Image"
              )}
            </Button>
          </form>
          {generatedImage && (
            <div className="mt-6">
              <h3 className="text-xl mb-2">Generated Image:</h3>
              <Image src={generatedImage || "/placeholder.svg"} alt="Generated" width={512} height={512} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

