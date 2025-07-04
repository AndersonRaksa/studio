"use client"

import { useMemo } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const monthlyReports = useMemo(() => {
    const reports: Record<string, { totalJobs: number; totalPhotos: number; totalConsumption: number }> = {};
    
    printJobs.forEach(job => {
      const monthKey = format(new Date(job.data_impressao), 'yyyy-MM');
      if (!reports[monthKey]) {
        reports[monthKey] = { totalJobs: 0, totalPhotos: 0, totalConsumption: 0 };
      }
      reports[monthKey].totalJobs += 1;
      reports[monthKey].totalPhotos += job.quantidade_fotos;
      reports[monthKey].totalConsumption += job.metros_consumidos;
    });

    return Object.entries(reports)
      .map(([key, value]) => ({
        monthKey: key,
        ...value,
      }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [printJobs]);

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    return `${monthName.charAt(0).toUpperCase() + monthName.slice(1)} de ${year}`;
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Histórico de Impressões"
        description="Veja todos os trabalhos de impressão registrados e relatórios mensais."
        actions={<RegisterPrintDialog />}
      />

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Relatório Mensal</h2>
        {monthlyReports.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {monthlyReports.map(report => (
              <Card key={report.monthKey}>
                <CardHeader>
                  <CardTitle>{formatMonth(report.monthKey)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total de Pedidos</span>
                    <span className="font-medium">{report.totalJobs}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Total de Fotos</span>
                    <span className="font-medium">{report.totalPhotos}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Consumo de Papel</span>
                    <span className="font-mono font-medium">{report.totalConsumption.toFixed(2)}m</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <p className="text-muted-foreground">Nenhuma impressão registrada para gerar relatórios.</p>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold tracking-tight mb-4">Todas as Impressões</h2>
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
      </section>
    </div>
  );
}
