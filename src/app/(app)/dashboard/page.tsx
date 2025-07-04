"use client"

import { useFilmData } from "@/contexts/film-data-context"
import { PageHeader } from "@/components/page-header"
import { AddRollDialog } from "@/components/add-roll-dialog"
import { RegisterPrintDialog } from "@/components/register-print-dialog"
import { RollCard } from "@/components/roll-card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function DashboardPage() {
  const { rolls } = useFilmData()
  const activeRolls = rolls.filter(roll => roll.ativo).slice(0, 3); // Show top 3 active rolls

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral dos seus rolos e ações rápidas."
        actions={
          <div className="flex items-center gap-2">
            <RegisterPrintDialog />
            <AddRollDialog />
          </div>
        }
      />
      
      <section className="space-y-4">
        <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold font-headline">Rolos Ativos</h2>
            <Button variant="link" asChild>
                <Link href="/rolls">
                    Ver todos <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </Button>
        </div>
        
        {activeRolls.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeRolls.map(roll => (
              <RollCard key={roll.id} roll={roll} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhum rolo ativo no momento.</p>
            <div className="mt-4">
              <AddRollDialog />
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
