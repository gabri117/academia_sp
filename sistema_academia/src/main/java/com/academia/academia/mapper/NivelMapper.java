package com.academia.academia.mapper;

import com.academia.academia.dto.nivel.NivelResponseDTO;
import com.academia.academia.entity.NivelAcademico;
import org.springframework.stereotype.Component;

@Component
public class NivelMapper {

    public NivelResponseDTO toResponse(NivelAcademico nivel) {
        if (nivel == null) {
            return null;
        }

        NivelResponseDTO dto = new NivelResponseDTO();
        dto.setNivelId(nivel.getNivelId());
        dto.setNombre(nivel.getNombre());
        return dto;
    }
}
