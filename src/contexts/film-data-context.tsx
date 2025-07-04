"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Roll, PrintJob, PrintSize } from '@/lib/types';
import { initialRolls, initialPrintJobs } from '@/lib/data';
import { useToast } from "@/hooks/use-toast"

interface FilmDataContextType {
  rolls: Roll[];
  printJobs: PrintJob[];
  addRoll: (rollData: Omit<Roll, 'id' | 'comprimento_atual_metros' | 'ativo'>) => void;
  registerPrint: (printData: Omit<PrintJob, 'id' | 'data_impressao' | 'metros_consumidos'>) => void;
  getRollById: (id: string) => Roll | undefined;
}

const FilmDataContext = createContext<FilmDataContextType | undefined>(undefined);

export const FilmDataProvider = ({ children }: { children: ReactNode }) => {
  const [rolls, setRolls] = useState<Roll[]>(initialRolls);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>(initialPrintJobs);
  const { toast } = useToast();

  const addRoll = (rollData: Omit<Roll, 'id' | 'comprimento_atual_metros' | 'ativo'>) => {
    const newRoll: Roll = {
      ...rollData,
      id: `${rollData.nome_rolo.toLowerCase().replace(/\s/g, '-')}-${new Date().getTime()}`,
      comprimento_atual_metros: rollData.comprimento_inicial_metros,
      ativo: true,
    };
    setRolls(prev => [newRoll, ...prev]);
    toast({
      title: "Rolo Adicionado",
      description: `O rolo "${newRoll.nome_rolo}" foi adicionado com sucesso.`,
    })
  };

  const registerPrint = (printData: Omit<PrintJob, 'id' | 'data_impressao' | 'metros_consumidos'>) => {
    const roll = rolls.find(r => r.id === printData.rolo_utilizado_id);
    if (!roll) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Rolo selecionado não encontrado.",
      });
      return;
    }

    let metros_consumidos = 0;
    if (printData.tipo_foto === '30x40') {
      metros_consumidos = 0.40 * printData.quantidade_fotos;
    } else if (printData.tipo_foto === '30x60') {
      metros_consumidos = 0.60 * printData.quantidade_fotos;
    }
    // Placeholder for custom logic
    
    if (roll.comprimento_atual_metros < metros_consumidos) {
       toast({
        variant: "destructive",
        title: "Papel Insuficiente",
        description: `O rolo "${roll.nome_rolo}" não tem comprimento suficiente.`,
      });
      return;
    }

    const newPrintJob: PrintJob = {
      ...printData,
      id: `print-${new Date().getTime()}`,
      data_impressao: new Date(),
      metros_consumidos,
    };

    setPrintJobs(prev => [newPrintJob, ...prev]);
    setRolls(prev => prev.map(r => {
      if (r.id === printData.rolo_utilizado_id) {
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
      description: `${printData.quantidade_fotos} fotos foram registradas no rolo "${roll.nome_rolo}".`,
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
