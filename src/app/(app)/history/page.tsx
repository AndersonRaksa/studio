"use client"

import { useFilmData } from "@/contexts/film-data-context";
import { PageHeader } from "@/components/page-header";
import { RegisterPrintDialog } from "@/components/register-print-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import type { PrintJob } from "@/lib/types";

export default function HistoryPage() {
  const { printJobs, getRollById } = useFilmData();
  
  const getPhotoTypeLabel = (job: PrintJob) => {
    if (job.tipo_foto === '20x30') return "20cm x 30cm";
    if (job.tipo_foto === '30x40') return "30cm x 40cm";
    if (job.tipo_foto === '30x60') return "30cm x 60cm";
    return "Custom";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de Impressões"
        description="Veja todos os trabalhos de impressão registrados."
        actions={<RegisterPrintDialog />}
      />

      <div className="border rounded-lg shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tamanho</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Metros Consumidos</TableHead>
              <TableHead>Rolo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printJobs.length > 0 ? (
              printJobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.nome_cliente}</TableCell>
                  <TableCell>{format(job.data_impressao, "dd/MM/yyyy")}</TableCell>
                  <TableCell>{getPhotoTypeLabel(job)}</TableCell>
                  <TableCell className="text-right">{job.quantidade_fotos}</TableCell>
                  <TableCell className="text-right font-mono">{job.metros_consumidos.toFixed(2)}m</TableCell>
                   <TableCell>{getRollById(job.rolo_utilizado_id)?.nome_rolo || 'N/A'}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  Nenhuma impressão registrada ainda.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
