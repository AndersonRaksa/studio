
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Roll, PrintJob } from '@/lib/types';
import { initialRolls, initialPrintJobs } from '@/lib/data';
import { useToast } from "@/hooks/use-toast"

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
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedRolls = localStorage.getItem('kobiyama-rolls');
      if (storedRolls) {
        const parsedRolls = JSON.parse(storedRolls).map((roll: Roll) => ({
          ...roll,
          data_compra: new Date(roll.data_compra),
        }));
        setRolls(parsedRolls);
      } else {
        setRolls(initialRolls);
      }

      const storedPrintJobs = localStorage.getItem('kobiyama-print-jobs');
      if (storedPrintJobs) {
        const parsedPrintJobs = JSON.parse(storedPrintJobs).map((job: PrintJob) => ({
          ...job,
          data_impressao: new Date(job.data_impressao),
        }));
        setPrintJobs(parsedPrintJobs);
      } else {
        setPrintJobs(initialPrintJobs);
      }
    } catch (error) {
      console.error("Error reading from localStorage", error);
      setRolls(initialRolls);
      setPrintJobs(initialPrintJobs);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('kobiyama-rolls', JSON.stringify(rolls));
        localStorage.setItem('kobiyama-print-jobs', JSON.stringify(printJobs));
      } catch (error) {
        console.error("Error writing to localStorage", error);
      }
    }
  }, [rolls, printJobs, isLoaded]);

  const getNumericId = (id: string) => {
    const parts = id.split('-');
    const numPart = parts[parts.length - 1];
    const num = parseInt(numPart, 10);
    return isNaN(num) ? 0 : num;
  }

  const addRoll = () => {
    const nextId = (rolls.length > 0 ? Math.max(...rolls.map(r => getNumericId(r.id))) : 0) + 1;
    const newRoll: Roll = {
      id: `fuji-roll-${nextId}`,
      nome_rolo: `Fuji Rolo #${nextId}`,
      data_compra: new Date(),
      comprimento_inicial_metros: 93,
      largura_cm: 30,
      comprimento_atual_metros: 93,
      ativo: true,
    };
    setRolls(prev => [newRoll, ...prev].sort((a,b) => b.data_compra.getTime() - a.data_compra.getTime()));
    toast({
      title: "Rolo Adicionado",
      description: `Um novo rolo Fuji foi adicionado ao estoque.`,
    })
  };

  const registerPrint = (printData: Omit<PrintJob, 'id' | 'data_impressao' | 'metros_consumidos' | 'rolo_utilizado_id'>) => {
    let singlePhotoConsumption = 0;
    if (printData.tipo_foto === '20x30') {
        singlePhotoConsumption = 0.30;
    } else if (printData.tipo_foto === '30x40') {
        singlePhotoConsumption = 0.40;
    } else if (printData.tipo_foto === '30x60') {
        singlePhotoConsumption = 0.60;
    }

    if (singlePhotoConsumption === 0) {
        toast({ variant: "destructive", title: "Erro", description: "Tamanho de foto inválido." });
        return;
    }

    let remainingPhotosToPrint = printData.quantidade_fotos;
    const sortedActiveRolls = rolls
      .filter(r => r.ativo)
      .sort((a, b) => a.data_compra.getTime() - b.data_compra.getTime());
    
    const rollsBeingUpdated: Roll[] = JSON.parse(JSON.stringify(rolls)); 
    const newJobsCreated: PrintJob[] = [];
    let totalPhotosPrinted = 0;

    for (const roll of sortedActiveRolls) {
        if (remainingPhotosToPrint <= 0) break;

        const currentRollState = rollsBeingUpdated.find(r => r.id === roll.id)!;
        
        const maxPhotosOnThisRoll = Math.floor(currentRollState.comprimento_atual_metros / singlePhotoConsumption);
        
        if (maxPhotosOnThisRoll <= 0) {
            if (currentRollState.comprimento_atual_metros < 0.60) {
                currentRollState.ativo = false;
            }
            continue; 
        }
        
        const photosToPrintFromThisRoll = Math.min(remainingPhotosToPrint, maxPhotosOnThisRoll);
        
        if (photosToPrintFromThisRoll > 0) {
            const consumptionForThisJob = photosToPrintFromThisRoll * singlePhotoConsumption;
            
            const newJob: PrintJob = {
                id: `print-${new Date().getTime()}-${newJobsCreated.length}`,
                rolo_utilizado_id: roll.id,
                nome_cliente: printData.nome_cliente,
                data_impressao: new Date(),
                tipo_foto: printData.tipo_foto,
                quantidade_fotos: photosToPrintFromThisRoll,
                metros_consumidos: consumptionForThisJob,
            };
            newJobsCreated.push(newJob);
            
            currentRollState.comprimento_atual_metros -= consumptionForThisJob;
            
            if (currentRollState.comprimento_atual_metros < 0.60) {
                currentRollState.ativo = false;
            }
            
            remainingPhotosToPrint -= photosToPrintFromThisRoll;
            totalPhotosPrinted += photosToPrintFromThisRoll;
        }
    }
    
    const finalRollsState = rollsBeingUpdated.map(r => ({ ...r, data_compra: new Date(r.data_compra) }))
      .sort((a, b) => new Date(b.data_compra).getTime() - new Date(a.data_compra).getTime());

    if (totalPhotosPrinted > 0) {
        setRolls(finalRollsState);
        setPrintJobs(prev => [...newJobsCreated, ...prev].sort((a,b) => b.data_impressao.getTime() - a.data_impressao.getTime()));
        
        toast({
            title: "Impressão Concluída",
            description: `${totalPhotosPrinted} de ${printData.quantidade_fotos} fotos para ${printData.nome_cliente} foram registradas.`,
        });

        if (remainingPhotosToPrint > 0) {
            toast({
                variant: "destructive",
                title: "Papel Insuficiente",
                description: `Não foi possível imprimir as ${remainingPhotosToPrint} fotos restantes.`,
            });
        }
    } else {
       toast({
          variant: "destructive",
          title: "Papel Insuficiente",
          description: "Nenhum rolo no estoque tem comprimento suficiente para esta impressão.",
       });
       setRolls(finalRollsState);
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
    if (!jobToDelete) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Impressão não encontrada.",
      });
      return;
    };

    setRolls(prevRolls => prevRolls.map(roll => {
      if (roll.id === jobToDelete.rolo_utilizado_id) {
        const restoredLength = roll.comprimento_atual_metros + jobToDelete.metros_consumidos;
        return {
          ...roll,
          comprimento_atual_metros: restoredLength,
          ativo: true,
        };
      }
      return roll;
    }));

    setPrintJobs(prevJobs => prevJobs.filter(job => job.id !== printJobId));

    toast({
      title: "Impressão Excluída",
      description: "O registro de impressão foi removido e o papel foi estornado ao rolo.",
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
