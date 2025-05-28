import { Link } from "react-router"

import { Button } from "@/components/ui/button"

export function HomePage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 bg-secondary">
      <h1 className="font-bold text-4xl text-secondary-foreground">Welcome to Interactive Mapgen</h1>
      <p className="text-lg text-secondary-foreground">This is a simple map generator powered by LLM.</p>
      <Button>
        <Link to={`/maps/${Math.round(Math.random() * (1 << 30))}`}>Start Generating</Link>
      </Button>
    </div>
  )
}
