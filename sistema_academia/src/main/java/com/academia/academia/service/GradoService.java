package com.academia.academia.service;

import com.academia.academia.dto.grado.GradoCreateDTO;
import com.academia.academia.dto.grado.GradoResponseDTO;
import com.academia.academia.dto.grado.GradoUpdateDTO;
import java.util.List;
import java.util.UUID;

public interface GradoService {

    List<GradoResponseDTO> listarTodos();

    List<GradoResponseDTO> listarPorNivel(UUID nivelId);

    GradoResponseDTO obtener(UUID gradoId);

    GradoResponseDTO crear(GradoCreateDTO dto);

    GradoResponseDTO actualizar(UUID gradoId, GradoUpdateDTO dto);

    void eliminar(UUID gradoId);
}
