import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { ModelCard } from '@/components/model-card'
import { ModelCardSkeleton } from '@/components/model-card-skeleton'
import { Plus } from 'lucide-react'

interface Model {
  id: number;  // Change from string to number
  title: string;
  name: string;
  createdAt: string;
}

async function getModels(): Promise<Model[]> {
  const res = await fetch('http://localhost:3000/api/models')
  if (!res.ok) {
    throw new Error('Failed to fetch models')
  }
  return res.json()
}

export default async function ModelsPage() {
  const models = await getModels()

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Models</h1>
        <Button asChild>
          <Link href="/models/new">
            <Plus className="mr-2 h-4 w-4" />
            Train New Model
          </Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<ModelCardSkeleton />}>
          {models.map((model) => (
            <ModelCard key={model.id} model={model} />
          ))}
        </Suspense>
      </div>
    </div>
  )
}

