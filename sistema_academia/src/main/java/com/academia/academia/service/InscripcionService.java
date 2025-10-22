package com.academia.academia.service;

import com.academia.academia.dto.inscripcion.InscripcionCreateDTO;
import com.academia.academia.dto.inscripcion.InscripcionResponseDTO;
import com.academia.academia.dto.inscripcion.InscripcionUpdateDTO;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface InscripcionService {

    Page<InscripcionResponseDTO> listar(Pageable pageable);

    InscripcionResponseDTO obtener(UUID id);

    InscripcionResponseDTO inscribir(InscripcionCreateDTO dto);

    InscripcionResponseDTO actualizar(UUID id, InscripcionUpdateDTO dto);

    void eliminar(UUID id);

    List<InscripcionResponseDTO> listarPorAlumno(UUID alumnoId);

    List<InscripcionResponseDTO> listarPorOferta(UUID ofertaId);
}
