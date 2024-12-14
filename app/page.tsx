import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <main className="text-center">
        <h1 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
          Welcome to Astria Web
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600 dark:text-gray-300">
          Unleash your creativity with AI-powered image generation. Train custom models and create stunning visuals with ease.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/auth/signup">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/auth/signin">Sign In</Link>
          </Button>
        </div>
      </main>
      <footer className="mt-16 text-center text-gray-500 dark:text-gray-400">
        <p>&copy; 2023 Astria Web. All rights reserved.</p>
      </footer>
    </div>
  )
}

