package com.academia.academia.service;

import com.academia.academia.dto.oferta.OfertaCursoCreateDTO;
import com.academia.academia.dto.oferta.OfertaCursoResponseDTO;
import com.academia.academia.dto.oferta.OfertaCursoUpdateDTO;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OfertaCursoService {

    Page<OfertaCursoResponseDTO> listar(UUID gradoId, UUID institutoId, UUID cursoId, Pageable pageable);

    OfertaCursoResponseDTO obtener(UUID id);

    OfertaCursoResponseDTO crear(OfertaCursoCreateDTO dto);

    OfertaCursoResponseDTO actualizar(UUID id, OfertaCursoUpdateDTO dto);

    void eliminar(UUID id);
}
