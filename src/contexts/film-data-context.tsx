"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { collection, query, onSnapshot, addDoc, serverTimestamp, orderBy, doc, runTransaction, deleteDoc, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Roll, PrintJob } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

// Helper to convert Firestore Timestamps to JS Dates
const convertTimestamps = (docData: any) => {
  const data = { ...docData };
  for (const key in data) {
    if (data[key]?.toDate && typeof data[key].toDate === 'function') {
      data[key] = data[key].toDate();
    }
  }
  return data;
};

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
  const { toast } = useToast();

  useEffect(() => {
    // Real-time listener for rolls
    const qRolls = query(collection(db, "rolls"), orderBy("data_compra", "desc"));
    const unsubscribeRolls = onSnapshot(qRolls, (querySnapshot) => {
      const rollsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data()),
      })) as Roll[];
      setRolls(rollsData);
    }, (error) => {
      console.error("Error fetching rolls:", error);
      toast({
        variant: "destructive",
        title: "Erro de Conexão",
        description: "Não foi possível carregar os rolos. Verifique sua conexão e a configuração do Firebase.",
      });
    });

    // Real-time listener for print jobs
    const qPrintJobs = query(collection(db, "printJobs"), orderBy("data_impressao", "desc"));
    const unsubscribePrintJobs = onSnapshot(qPrintJobs, (querySnapshot) => {
      const printJobsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...convertTimestamps(doc.data()),
      })) as PrintJob[];
      setPrintJobs(printJobsData);
    }, (error) => {
      console.error("Error fetching print jobs:", error);
      toast({
        variant: "destructive",
        title: "Erro de Conexão",
        description: "Não foi possível carregar o histórico de impressões.",
      });
    });

    // Cleanup listeners on unmount
    return () => {
      unsubscribeRolls();
      unsubscribePrintJobs();
    };
  }, [toast]);

  const addRoll = async () => {
    try {
      const newRollData = {
        nome_rolo: `Fuji Rolo #${rolls.length + 1}`,
        data_compra: serverTimestamp(),
        comprimento_inicial_metros: 93,
        largura_cm: 30,
        comprimento_atual_metros: 93,
        ativo: true,
      };
      await addDoc(collection(db, "rolls"), newRollData);
      toast({
        title: "Rolo Adicionado",
        description: `Um novo rolo Fuji foi adicionado ao estoque.`,
      });
    } catch (error) {
      console.error("Error adding roll:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível adicionar o rolo." });
    }
  };

  const registerPrint = async (printData: Omit<PrintJob, 'id' | 'data_impressao' | 'metros_consumidos' | 'rolo_utilizado_id'>) => {
    let singlePhotoConsumption = 0;
    if (printData.tipo_foto === '20x30') singlePhotoConsumption = 0.30;
    else if (printData.tipo_foto === '30x40') singlePhotoConsumption = 0.40;
    else if (printData.tipo_foto === '30x60') singlePhotoConsumption = 0.60;

    if (singlePhotoConsumption === 0) {
      toast({ variant: "destructive", title: "Erro", description: "Tamanho de foto inválido." });
      return;
    }

    try {
      await runTransaction(db, async (transaction) => {
        let remainingPhotosToPrint = printData.quantidade_fotos;
        let totalPhotosPrinted = 0;
        
        const rollsQuery = query(collection(db, "rolls"), where("ativo", "==", true), orderBy("data_compra", "asc"));
        const activeRollsSnapshot = await getDocs(rollsQuery);

        if (activeRollsSnapshot.empty && remainingPhotosToPrint > 0) {
            throw new Error("Nenhum rolo ativo no estoque.");
        }

        for (const rollDoc of activeRollsSnapshot.docs) {
          if (remainingPhotosToPrint <= 0) break;

          const roll = { id: rollDoc.id, ...rollDoc.data() } as Roll;
          const rollRef = doc(db, "rolls", roll.id);
          
          const maxPhotosOnThisRoll = Math.floor(roll.comprimento_atual_metros / singlePhotoConsumption);
          if (maxPhotosOnThisRoll <= 0) continue;

          const photosToPrintFromThisRoll = Math.min(remainingPhotosToPrint, maxPhotosOnThisRoll);

          if (photosToPrintFromThisRoll > 0) {
            const consumptionForThisJob = photosToPrintFromThisRoll * singlePhotoConsumption;
            
            const newJobData = {
              rolo_utilizado_id: roll.id,
              nome_cliente: printData.nome_cliente,
              data_impressao: serverTimestamp(),
              tipo_foto: printData.tipo_foto,
              quantidade_fotos: photosToPrintFromThisRoll,
              metros_consumidos: consumptionForThisJob,
            };
            
            const newJobRef = doc(collection(db, "printJobs"));
            transaction.set(newJobRef, newJobData);

            const newLength = roll.comprimento_atual_metros - consumptionForThisJob;
            const newActivoState = newLength >= 0.60;

            transaction.update(rollRef, {
              comprimento_atual_metros: newLength,
              ativo: newActivoState,
            });

            remainingPhotosToPrint -= photosToPrintFromThisRoll;
            totalPhotosPrinted += photosToPrintFromThisRoll;
          }
        }
        
        if (totalPhotosPrinted === 0) {
            throw new Error("Nenhum rolo no estoque tem comprimento suficiente para esta impressão.");
        }

        toast({
          title: "Impressão Registrada",
          description: `${totalPhotosPrinted} de ${printData.quantidade_fotos} fotos para ${printData.nome_cliente} foram processadas.`,
        });

        if (remainingPhotosToPrint > 0) {
          toast({
            variant: "destructive",
            title: "Papel Insuficiente",
            description: `Não foi possível imprimir ${remainingPhotosToPrint} fotos restantes. Adicione mais rolos.`,
          });
        }
      });
    } catch (error: any) {
        console.error("Transaction failed: ", error);
        toast({
            variant: "destructive",
            title: "Falha na Transação",
            description: error.message || "Não foi possível registrar a impressão.",
        });
    }
  };

  const deleteRoll = async (rollId: string) => {
    const isRollUsed = printJobs.some(job => job.rolo_utilizado_id === rollId);
    if (isRollUsed) {
      toast({
        variant: "destructive",
        title: "Erro ao Excluir",
        description: "Este rolo não pode ser excluído pois possui impressões associadas.",
      });
      return;
    }

    try {
      await deleteDoc(doc(db, "rolls", rollId));
      toast({
        title: "Rolo Excluído",
        description: "O rolo foi removido do estoque.",
      });
    } catch (error) {
      console.error("Error deleting roll:", error);
      toast({ variant: "destructive", title: "Erro", description: "Não foi possível excluir o rolo." });
    }
  };

  const deletePrintJob = async (printJobId: string) => {
    const jobToDelete = printJobs.find(job => job.id === printJobId);
    if (!jobToDelete) return;
    
    const rollRef = doc(db, "rolls", jobToDelete.rolo_utilizado_id);
    const jobRef = doc(db, "printJobs", printJobId);

    try {
        await runTransaction(db, async (transaction) => {
            const rollDoc = await transaction.get(rollRef);
            if (!rollDoc.exists()) {
                throw new Error("Rolo associado não encontrado!");
            }

            const rollData = rollDoc.data();
            const restoredLength = rollData.comprimento_atual_metros + jobToDelete.metros_consumidos;

            transaction.update(rollRef, {
                comprimento_atual_metros: restoredLength,
                ativo: true,
            });

            transaction.delete(jobRef);
        });

        toast({
          title: "Impressão Excluída",
          description: "O registro foi removido e o papel estornado ao rolo.",
        });
    } catch (error: any) {
        console.error("Error deleting print job:", error);
        toast({
            variant: "destructive",
            title: "Erro ao Excluir",
            description: error.message || "Não foi possível excluir a impressão.",
        });
    }
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
