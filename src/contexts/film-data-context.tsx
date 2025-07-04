"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
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
  const [rolls, setRolls] = useState<Roll[]>(initialRolls);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>(initialPrintJobs);
  const { toast } = useToast();

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
    const availableRolls = rolls
      .filter(r => r.ativo)
      .sort((a, b) => a.data_compra.getTime() - b.data_compra.getTime());

    if (availableRolls.length === 0) {
       toast({
        variant: "destructive",
        title: "Erro",
        description: "Nenhum rolo disponível no estoque.",
      });
      return;
    }
    const roll = availableRolls[0];
    
    let metros_consumidos = 0;
    if (printData.tipo_foto === '20x30') {
      metros_consumidos = 0.30 * printData.quantidade_fotos;
    } else if (printData.tipo_foto === '30x40') {
      metros_consumidos = 0.40 * printData.quantidade_fotos;
    } else if (printData.tipo_foto === '30x60') {
      metros_consumidos = 0.60 * printData.quantidade_fotos;
    }
    
    if (roll.comprimento_atual_metros < metros_consumidos) {
       toast({
        variant: "destructive",
        title: "Papel Insuficiente",
        description: `O rolo "${roll.nome_rolo}" não tem comprimento suficiente para esta impressão.`,
      });
      return;
    }

    const newPrintJob: PrintJob = {
      ...printData,
      id: `print-${new Date().getTime()}`,
      rolo_utilizado_id: roll.id,
      data_impressao: new Date(),
      metros_consumidos,
    };

    setPrintJobs(prev => [newPrintJob, ...prev].sort((a,b) => b.data_impressao.getTime() - a.data_impressao.getTime()));
    setRolls(prev => prev.map(r => {
      if (r.id === roll.id) {
        const newLength = r.comprimento_atual_metros - metros_consumidos;
        return {
          ...r,
          comprimento_atual_metros: newLength,
          ativo: newLength > 0,
        };
      }
      return r;
    }));
     toast({
      title: "Impressão Registrada",
      description: `${printData.quantidade_fotos} fotos para ${printData.nome_cliente} foram registradas.`,
    })
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
