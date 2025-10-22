package com.academia.academia.service;

import com.academia.academia.dto.calificacion.CalificacionCreateDTO;
import com.academia.academia.dto.calificacion.CalificacionResponseDTO;
import java.util.List;
import java.util.UUID;

public interface CalificacionService {

    CalificacionResponseDTO registrar(CalificacionCreateDTO dto);

    List<CalificacionResponseDTO> listarPorInscripcion(UUID inscripcionId);

    List<CalificacionResponseDTO> listarPorOferta(UUID ofertaId);
}
