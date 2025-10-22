package com.academia.academia.service;

import com.academia.academia.dto.alumno.AlumnoCreateDTO;
import com.academia.academia.dto.alumno.AlumnoResponseDTO;
import com.academia.academia.dto.alumno.AlumnoUpdateDTO;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AlumnoService {

    Page<AlumnoResponseDTO> listar(Pageable pageable);

    AlumnoResponseDTO obtener(UUID id);

    AlumnoResponseDTO crear(AlumnoCreateDTO dto);

    AlumnoResponseDTO actualizar(UUID id, AlumnoUpdateDTO dto);

    void eliminar(UUID id);
}
