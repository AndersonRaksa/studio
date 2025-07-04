"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Roll, PrintJob, PrintSize } from '@/lib/types';
import { initialRolls, initialPrintJobs } from '@/lib/data';
import { useToast } from "@/hooks/use-toast"

interface FilmDataContextType {
  rolls: Roll[];
  printJobs: PrintJob[];
  addRoll: () => void;
  registerPrint: (printData: Omit<PrintJob, 'id' | 'data_impressao' | 'metros_consumidos' | 'rolo_utilizado_id'>) => void;
  getRollById: (id: string) => Roll | undefined;
  getTotalRolls: () => number;
}

const FilmDataContext = createContext<FilmDataContextType | undefined>(undefined);

export const FilmDataProvider = ({ children }: { children: ReactNode }) => {
  const [rolls, setRolls] = useState<Roll[]>(initialRolls);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>(initialPrintJobs);
  const { toast } = useToast();

  const getTotalRolls = () => {
    return rolls.filter(r => r.ativo).length;
  }

  const addRoll = () => {
    const nextId = rolls.length > 0 ? Math.max(...rolls.map(r => parseInt(r.id.split('-')[2], 10))) + 1 : 1;
    const newRoll: Roll = {
      id: `fuji-roll-${nextId}`,
      nome_rolo: `Fuji Rolo #${nextId}`,
      data_compra: new Date(),
      comprimento_inicial_metros: 93,
      largura_cm: 30,
      comprimento_atual_metros: 93,
      ativo: true,
    };
    setRolls(prev => [newRoll, ...prev]);
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

  const getRollById = (id: string) => {
    return rolls.find(r => r.id === id);
  };

  const value = {
    rolls,
    printJobs,
    addRoll,
    registerPrint,
    getRollById,
    getTotalRolls,
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
