package com.academia.academia.service;

import com.academia.academia.dto.asistencia.AsistenciaCreateDTO;
import com.academia.academia.dto.asistencia.AsistenciaResponseDTO;
import java.util.List;
import java.util.UUID;

public interface AsistenciaService {

    AsistenciaResponseDTO registrar(AsistenciaCreateDTO dto);

    List<AsistenciaResponseDTO> listarPorSesion(UUID sessionId);

    List<AsistenciaResponseDTO> listarPorInscripcion(UUID inscripcionId);
}
