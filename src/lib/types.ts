export interface Roll {
  id: string;
  nome_rolo: string;
  data_compra: Date;
  comprimento_inicial_metros: number;
  largura_cm: number;
  comprimento_atual_metros: number;
  ativo: boolean;
  observacoes?: string;
}

export type PrintSize = "20x30" | "30x40" | "30x60" | "custom";

export interface PrintJob {
  id: string;
  rolo_utilizado_id: string;
  nome_cliente: string;
  data_impressao: Date;
  tipo_foto: PrintSize;
  custom_size_cm?: { width: number; height: number };
  quantidade_fotos: number;
  metros_consumidos: number;
}
