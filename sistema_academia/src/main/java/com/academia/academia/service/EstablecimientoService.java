package com.academia.academia.service;

import com.academia.academia.dto.establecimiento.EstablecimientoCreateDTO;
import com.academia.academia.dto.establecimiento.EstablecimientoResponseDTO;
import com.academia.academia.dto.establecimiento.EstablecimientoUpdateDTO;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EstablecimientoService {

    Page<EstablecimientoResponseDTO> listar(Pageable pageable);

    EstablecimientoResponseDTO obtener(UUID institutoId);

    EstablecimientoResponseDTO crear(EstablecimientoCreateDTO dto);

    EstablecimientoResponseDTO actualizar(UUID institutoId, EstablecimientoUpdateDTO dto);

    void eliminar(UUID institutoId);
}
