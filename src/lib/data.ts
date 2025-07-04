import type { Roll, PrintJob } from './types';

export const initialRolls: Roll[] = [
  {
    id: 'fuji-brilhante-01',
    nome_rolo: 'Rolo Fuji Brilhante',
    data_compra: new Date('2023-10-15T00:00:00'),
    comprimento_inicial_metros: 93,
    largura_cm: 30,
    comprimento_atual_metros: 65.5,
    ativo: true,
    observacoes: 'Rolo padrão para retratos.'
  },
  {
    id: 'kodak-fosco-01',
    nome_rolo: 'Rolo Kodak Fosco',
    data_compra: new Date('2023-11-20T00:00:00'),
    comprimento_inicial_metros: 93,
    largura_cm: 30,
    comprimento_atual_metros: 93,
    ativo: true,
  },
  {
    id: 'ilford-pb-01',
    nome_rolo: 'Rolo Ilford P&B',
    data_compra: new Date('2023-09-01T00:00:00'),
    comprimento_inicial_metros: 93,
    largura_cm: 30,
    comprimento_atual_metros: 0,
    ativo: false,
    observacoes: 'Esgotado em projeto de paisagens.'
  }
];

export const initialPrintJobs: PrintJob[] = [
  {
    id: 'print-001',
    rolo_utilizado_id: 'fuji-brilhante-01',
    data_impressao: new Date('2023-11-05T00:00:00'),
    tipo_foto: '30x40',
    quantidade_fotos: 20,
    metros_consumidos: 8,
  },
  {
    id: 'print-002',
    rolo_utilizado_id: 'fuji-brilhante-01',
    data_impressao: new Date('2023-12-10T00:00:00'),
    tipo_foto: '30x60',
    quantidade_fotos: 15,
    metros_consumidos: 9,
  },
    {
    id: 'print-003',
    rolo_utilizado_id: 'fuji-brilhante-01',
    data_impressao: new Date('2024-01-20T00:00:00'),
    tipo_foto: '30x40',
    quantidade_fotos: 26,
    metros_consumidos: 10.5,
  },
];
