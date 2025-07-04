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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Trash2 } from "lucide-react";


export default function HistoryPage() {
  const { printJobs, getRollById, deletePrintJob } = useFilmData();
  
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
              <TableHead>Rolo</TableHead>
              <TableHead className="text-right">Quantidade</TableHead>
              <TableHead className="text-right">Consumo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {printJobs.length > 0 ? (
              printJobs.map(job => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.nome_cliente}</TableCell>
                  <TableCell>{format(job.data_impressao, "dd/MM/yyyy")}</TableCell>
                  <TableCell>{getPhotoTypeLabel(job)}</TableCell>
                  <TableCell>{getRollById(job.rolo_utilizado_id)?.nome_rolo || 'N/A'}</TableCell>
                  <TableCell className="text-right">{job.quantidade_fotos}</TableCell>
                  <TableCell className="text-right font-mono">{job.metros_consumidos.toFixed(2)}m</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Abrir menu</span>
                                  <MoreHorizontal className="h-4 w-4" />
                              </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <AlertDialogTrigger asChild>
                                  <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Excluir
                                  </DropdownMenuItem>
                              </AlertDialogTrigger>
                          </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                          <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá o registro de impressão e devolverá o papel consumido ao rolo.
                          </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deletePrintJob(job.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Excluir
                          </AlertDialogAction>
                          </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
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
