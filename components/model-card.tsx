import Link from 'next/link'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ModelCardProps {
  model: {
    id: number;  // Ensure this is a number
    title: string;
    name: string;
    createdAt: string;
  }
}

export function ModelCard({ model }: ModelCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{model.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">Name: {model.name}</p>
        <p className="text-sm text-muted-foreground">
          Created: {new Date(model.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href={`/models/${model.id}`}>View</Link>
        </Button>
        <Button asChild>
          <Link href={`/models/${model.id}/generate`}>Generate Images</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

