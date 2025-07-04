"use client"

import { useFilmData } from "@/contexts/film-data-context"
import { PageHeader } from "@/components/page-header"
import { AddRollDialog } from "@/components/add-roll-dialog"
import { RegisterPrintDialog } from "@/components/register-print-dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Film, History } from "lucide-react"
import { RollConsumptionChart } from "@/components/roll-consumption-chart"

export default function DashboardPage() {
  const { rolls, printJobs } = useFilmData()
  const activeRolls = rolls.filter(r => r.ativo);
  const activeRollsCount = activeRolls.length;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Visão geral do seu estoque e ações rápidas."
        actions={
          <div className="flex items-center gap-2">
            <RegisterPrintDialog />
            <AddRollDialog />
          </div>
        }
      />
      
      <section>
        <div className="grid gap-4 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Quantidade de Rolos</CardTitle>
                    <Film className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{activeRollsCount}</div>
                    <p className="text-xs text-muted-foreground">
                        Total de rolos ativos no estoque.
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Impressões</CardTitle>
                    <History className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{printJobs.length}</div>
                      <p className="text-xs text-muted-foreground">
                        Registros no histórico.
                    </p>
                </CardContent>
            </Card>
        </div>
      </section>

      {activeRolls.length > 0 ? (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Consumo dos Rolos</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <RollConsumptionChart data={activeRolls} />
            </CardContent>
          </Card>
        </section>
      ) : (
        <section>
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Nenhum rolo no estoque para exibir o gráfico.</p>
              <div className="mt-4">
                <AddRollDialog />
              </div>
            </div>
        </section>
      )}
    </div>
  )
}
