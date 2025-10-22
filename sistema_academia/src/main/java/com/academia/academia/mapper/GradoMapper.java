package com.academia.academia.mapper;

import com.academia.academia.dto.grado.GradoResponseDTO;
import com.academia.academia.entity.GradoAcademico;
import com.academia.academia.entity.NivelAcademico;
import org.springframework.stereotype.Component;

@Component
public class GradoMapper {

    public GradoResponseDTO toResponse(GradoAcademico grado) {
        if (grado == null) {
            return null;
        }

        GradoResponseDTO dto = new GradoResponseDTO();
        dto.setGradoId(grado.getGradoId());

        NivelAcademico nivel = grado.getNivelAcademico();
        if (nivel != null) {
            dto.setNivelId(nivel.getNivelId());
        }

        dto.setNombre(grado.getNombre());
        return dto;
    }
}
