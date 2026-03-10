export class EquipamentoProps {
  id: string;
  ativo: boolean;
  tag: string; // sigla da categoria ex: "AC", "GE", "BBA"
  num_tag: number; // sequencial dentro da categoria ex: 1, 2, 3
  name_equipamento: string;
  categoria_id: string;
  modelo?: string | null;
  fabricante?: string | null;
  local_instalacao?: string | null;
  descricao?: string | null;
  file_equipamento?: string | null;
  // falta ordem de servico
}
