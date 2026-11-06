/**
 * Só serve num acampamento quem já passou pela etapa dele: a etapa atual da
 * tenda precisa ser a do acampamento ou uma posterior. Tenda sem etapa
 * registrada não serve até ter a etapa definida.
 */
export function canServe(tentStagePosition: number | null | undefined, campStagePosition: number) {
  return tentStagePosition != null && tentStagePosition >= campStagePosition;
}
