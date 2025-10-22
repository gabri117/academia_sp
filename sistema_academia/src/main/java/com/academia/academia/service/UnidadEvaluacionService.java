package com.academia.academia.service;

import com.academia.academia.dto.evaluacion.UnidadEvaluacionResponseDTO;
import java.util.List;
import java.util.UUID;

public interface UnidadEvaluacionService {

    UnidadEvaluacionResponseDTO crearUnidad(UUID ofertaId, String nombre);

    List<UnidadEvaluacionResponseDTO> listarPorOferta(UUID ofertaId);
}
