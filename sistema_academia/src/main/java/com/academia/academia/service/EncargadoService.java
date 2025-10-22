package com.academia.academia.service;

import com.academia.academia.dto.encargado.EncargadoCreateDTO;
import com.academia.academia.dto.encargado.EncargadoResponseDTO;
import com.academia.academia.dto.encargado.EncargadoUpdateDTO;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EncargadoService {

    Page<EncargadoResponseDTO> listar(Pageable pageable);

    EncargadoResponseDTO obtener(UUID id);

    EncargadoResponseDTO crear(EncargadoCreateDTO dto);

    EncargadoResponseDTO actualizar(UUID id, EncargadoUpdateDTO dto);

    void eliminar(UUID id);
}
