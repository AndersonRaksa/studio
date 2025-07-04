"use client"

import { useFilmData } from "@/contexts/film-data-context"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export function AddRollDialog() {
  const { addRoll } = useFilmData()

  return (
    <Button onClick={() => addRoll()}>
      <PlusCircle className="mr-2" />
      Adicionar Rolo
    </Button>
  )
}
