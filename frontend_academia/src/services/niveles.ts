import {
  createNivel as apiCreateNivel,
  deleteNivel as apiDeleteNivel,
  getNivel as apiGetNivel,
  listNiveles as apiListNiveles,
  updateNivel as apiUpdateNivel,
} from '../api/client'
import type { Nivel, NivelCreateUpdateDTO, UUID } from '../contract/moduleA'

export type NivelesDict = Map<string, string>

export const listNiveles = (): Promise<Nivel[]> => apiListNiveles()

export const listarNivelesLite = async (): Promise<NivelesDict> => {
  const niveles = await apiListNiveles()
  return new Map(
    niveles.map((nivel) => [
      nivel.nivelId,
      nivel.nombre ?? '\u2014', // TODO(backend): asegurar nombre de nivel en respuesta.
    ]),
  )
}

export const getNivel = (nivelId: UUID) => apiGetNivel(nivelId)

export const createNivel = (payload: NivelCreateUpdateDTO) => apiCreateNivel(payload)

export const updateNivel = (nivelId: UUID, payload: NivelCreateUpdateDTO) =>
  apiUpdateNivel(nivelId, payload)

export const removeNivel = (nivelId: UUID) => apiDeleteNivel(nivelId)
