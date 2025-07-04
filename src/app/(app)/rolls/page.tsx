"use client"

import { useState, useMemo } from 'react';
import { useFilmData } from "@/contexts/film-data-context"
import { PageHeader } from "@/components/page-header"
import { AddRollDialog } from "@/components/add-roll-dialog"
import { RollCard } from "@/components/roll-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type FilterStatus = "all" | "active" | "empty";

export default function RollsPage() {
  const { rolls } = useFilmData();
  const [filter, setFilter] = useState<FilterStatus>("all");

  const filteredRolls = useMemo(() => {
    if (filter === 'active') return rolls.filter(r => r.ativo);
    if (filter === 'empty') return rolls.filter(r => !r.ativo);
    return rolls;
  }, [rolls, filter]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Rolos"
        description="Gerencie todos os seus rolos de filme aqui."
        actions={<AddRollDialog />}
      />

      <Tabs value={filter} onValueChange={(value) => setFilter(value as FilterStatus)}>
        <TabsList>
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="active">Ativos</TabsTrigger>
          <TabsTrigger value="empty">Esgotados</TabsTrigger>
        </TabsList>
        <TabsContent value={filter} className="mt-6">
           {filteredRolls.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredRolls.map(roll => (
                <RollCard key={roll.id} roll={roll} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Nenhum rolo encontrado para este filtro.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
