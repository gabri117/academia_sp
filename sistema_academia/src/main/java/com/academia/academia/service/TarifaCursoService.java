package com.academia.academia.service;

import com.academia.academia.dto.pagos.TarifaCursoCreateDTO;
import com.academia.academia.dto.pagos.TarifaCursoResponseDTO;
import com.academia.academia.dto.pagos.TarifaCursoUpdateDTO;
import java.util.List;
import java.util.UUID;

public interface TarifaCursoService {

    TarifaCursoResponseDTO crear(TarifaCursoCreateDTO dto);

    TarifaCursoResponseDTO actualizar(UUID id, TarifaCursoUpdateDTO dto);

    TarifaCursoResponseDTO obtener(UUID id);

    void eliminar(UUID id);

    List<TarifaCursoResponseDTO> listarPorOferta(UUID ofertaId);
}
