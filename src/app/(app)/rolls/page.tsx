"use client"

import { useMemo } from 'react';
import { useFilmData } from "@/contexts/film-data-context"
import { PageHeader } from "@/components/page-header"
import { AddRollDialog } from "@/components/add-roll-dialog"
import { RollCard } from "@/components/roll-card"

export default function RollsPage() {
  const { rolls } = useFilmData();

  const activeRolls = useMemo(() => {
    return rolls.filter(r => r.ativo);
  }, [rolls]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Meus Rolos"
        description="Gerencie todos os seus rolos de filme aqui."
        actions={<AddRollDialog />}
      />

      <div className="mt-6">
        {activeRolls.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeRolls.map(roll => (
              <RollCard key={roll.id} roll={roll} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhum rolo ativo no estoque.</p>
            <div className="mt-4">
              <AddRollDialog />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
