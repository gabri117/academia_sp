package com.academia.academia.service;

import com.academia.academia.dto.nivel.NivelCreateDTO;
import com.academia.academia.dto.nivel.NivelResponseDTO;
import com.academia.academia.dto.nivel.NivelUpdateDTO;
import java.util.List;
import java.util.UUID;

public interface NivelService {

    List<NivelResponseDTO> listarTodos();

    NivelResponseDTO obtener(UUID nivelId);

    NivelResponseDTO crear(NivelCreateDTO dto);

    NivelResponseDTO actualizar(UUID nivelId, NivelUpdateDTO dto);

    void eliminar(UUID nivelId);
}
