"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Roll, PrintJob } from '@/lib/types';
import { initialRolls, initialPrintJobs } from '@/lib/data';
import { useToast } from "@/hooks/use-toast";
import type { PrintSize } from "@/lib/types";

interface FilmDataContextType {
  rolls: Roll[];
  printJobs: PrintJob[];
  addRoll: () => void;
  registerPrint: (printData: Omit<PrintJob, 'id' | 'data_impressao' | 'metros_consumidos' | 'rolo_utilizado_id'>) => void;
  getRollById: (id: string) => Roll | undefined;
  deleteRoll: (rollId: string) => void;
  deletePrintJob: (printJobId: string) => void;
}

const FilmDataContext = createContext<FilmDataContextType | undefined>(undefined);

export const FilmDataProvider = ({ children }: { children: ReactNode }) => {
  const [rolls, setRolls] = useState<Roll[]>(() => {
    if (typeof window === 'undefined') return initialRolls;
    try {
      const savedRolls = localStorage.getItem('rolls');
      return savedRolls ? JSON.parse(savedRolls, (key, value) => {
          if (key === 'data_compra') return new Date(value);
          return value;
      }) : initialRolls;
    } catch (error) {
      console.error("Failed to parse rolls from localStorage", error);
      return initialRolls;
    }
  });

  const [printJobs, setPrintJobs] = useState<PrintJob[]>(() => {
    if (typeof window === 'undefined') return initialPrintJobs;
    try {
      const savedPrintJobs = localStorage.getItem('printJobs');
      return savedPrintJobs ? JSON.parse(savedPrintJobs, (key, value) => {
          if (key === 'data_impressao') return new Date(value);
          return value;
      }) : initialPrintJobs;
    } catch (error) {
        console.error("Failed to parse print jobs from localStorage", error);
        return initialPrintJobs;
    }
  });

  const { toast } = useToast();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rolls', JSON.stringify(rolls));
    }
  }, [rolls]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('printJobs', JSON.stringify(printJobs));
    }
  }, [printJobs]);

  const addRoll = () => {
    const newRoll: Roll = {
      id: `roll_${new Date().getTime()}`,
      nome_rolo: `Fuji Rolo #${rolls.length + 1}`,
      data_compra: new Date(),
      comprimento_inicial_metros: 93,
      largura_cm: 30,
      comprimento_atual_metros: 93,
      ativo: true,
    };
    setRolls(prev => [...prev, newRoll]);
    toast({
      title: "Rolo Adicionado",
      description: `Um novo rolo Fuji foi adicionado ao estoque.`,
    });
  };

  const registerPrint = (printData: Omit<PrintJob, 'id' | 'data_impressao' | 'metros_consumidos' | 'rolo_utilizado_id' | 'tipo_foto'> & { tipo_foto: PrintSize }) => {
    let singlePhotoConsumption = 0;
    if (printData.tipo_foto === '20x30') singlePhotoConsumption = 0.30;
    else if (printData.tipo_foto === '30x40') singlePhotoConsumption = 0.40;
    else if (printData.tipo_foto === '30x60') singlePhotoConsumption = 0.60;

    if (singlePhotoConsumption === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Tamanho de foto inválido." });
      return;
    }
    
    let photosLeftToPrint = printData.quantidade_fotos;
    const newPrintJobs: PrintJob[] = [];
    let updatedRolls = JSON.parse(JSON.stringify(rolls)); // Deep copy
    let photosProcessed = 0;

    const activeRolls = updatedRolls
      .filter((r: Roll) => r.ativo)
      .sort((a: Roll, b: Roll) => new Date(a.data_compra).getTime() - new Date(b.data_compra).getTime());

    if (activeRolls.length === 0 && photosLeftToPrint > 0) {
      toast({
        variant: "destructive",
        title: "Falha na Impressão",
        description: "Nenhum rolo ativo no estoque.",
      });
      return;
    }

    for (const roll of activeRolls) {
        if (photosLeftToPrint <= 0) break;
        
        const maxPhotosOnThisRoll = Math.floor(roll.comprimento_atual_metros / singlePhotoConsumption);
        
        if (maxPhotosOnThisRoll <= 0) continue;

        const photosToPrintFromThisRoll = Math.min(photosLeftToPrint, maxPhotosOnThisRoll);
        
        if (photosToPrintFromThisRoll > 0) {
            const consumptionForThisJob = photosToPrintFromThisRoll * singlePhotoConsumption;

            const newJob: PrintJob = {
                id: `print_${new Date().getTime()}_${roll.id}`,
                rolo_utilizado_id: roll.id,
                nome_cliente: printData.nome_cliente,
                data_impressao: new Date(),
                tipo_foto: printData.tipo_foto,
                quantidade_fotos: photosToPrintFromThisRoll,
                metros_consumidos: consumptionForThisJob,
            };
            newPrintJobs.push(newJob);

            const rollIndex = updatedRolls.findIndex((r: Roll) => r.id === roll.id);
            if(rollIndex !== -1) {
                const currentRoll = updatedRolls[rollIndex];
                const newLength = currentRoll.comprimento_atual_metros - consumptionForThisJob;
                currentRoll.comprimento_atual_metros = newLength;
                
                if (newLength < 0.60) {
                    currentRoll.ativo = false;
                }
            }

            photosLeftToPrint -= photosToPrintFromThisRoll;
            photosProcessed += photosToPrintFromThisRoll;
        }
    }
    
    if (newPrintJobs.length > 0) {
        setPrintJobs(prev => [...prev, ...newPrintJobs].sort((a,b) => new Date(b.data_impressao).getTime() - new Date(a.data_impressao).getTime()));
        setRolls(updatedRolls.map((r: any) => ({...r, data_compra: new Date(r.data_compra)})));
        toast({
            title: "Impressão Registrada",
            description: `${photosProcessed} de ${printData.quantidade_fotos} fotos para ${printData.nome_cliente} foram processadas.`,
        });
    }

    if (photosLeftToPrint > 0) {
        toast({
            variant: "destructive",
            title: "Papel Insuficiente",
            description: `Não foi possível imprimir ${photosLeftToPrint} fotos restantes. Adicione mais rolos.`,
        });
    }
  };

  const deleteRoll = (rollId: string) => {
    const isRollUsed = printJobs.some(job => job.rolo_utilizado_id === rollId);
    if (isRollUsed) {
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: "Este rolo não pode ser excluído pois possui impressões associadas.",
      });
      return;
    }
    setRolls(prev => prev.filter(r => r.id !== rollId));
    toast({
      title: "Rolo Excluído",
      description: "O rolo foi removido do estoque.",
    });
  };

  const deletePrintJob = (printJobId: string) => {
    const jobToDelete = printJobs.find(job => job.id === printJobId);
    if (!jobToDelete) return;

    setRolls(prevRolls => {
      const newRolls = [...prevRolls];
      const rollIndex = newRolls.findIndex(r => r.id === jobToDelete.rolo_utilizado_id);
      if (rollIndex !== -1) {
        const roll = newRolls[rollIndex];
        roll.comprimento_atual_metros += jobToDelete.metros_consumidos;
        if (!roll.ativo && roll.comprimento_atual_metros >= 0.60) {
          roll.ativo = true;
        }
      }
      return newRolls;
    });

    setPrintJobs(prevJobs => prevJobs.filter(job => job.id !== printJobId));
    toast({
      title: "Impressão Excluída",
      description: "O registro foi removido e o papel estornado ao rolo.",
    });
  };

  const getRollById = (id: string) => {
    return rolls.find(r => r.id === id);
  };

  const value = {
    rolls,
    printJobs,
    addRoll,
    registerPrint,
    getRollById,
    deleteRoll,
    deletePrintJob,
  };

  return (
    <FilmDataContext.Provider value={value}>
      {children}
    </FilmDataContext.Provider>
  );
};

export const useFilmData = () => {
  const context = useContext(FilmDataContext);
  if (context === undefined) {
    throw new Error('useFilmData must be used within a FilmDataProvider');
  }
  return context;
};
