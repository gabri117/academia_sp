package com.academia.academia.mapper;

import com.academia.academia.dto.establecimiento.EstablecimientoResponseDTO;
import com.academia.academia.entity.Establecimiento;
import org.springframework.stereotype.Component;

@Component
public class EstablecimientoMapper {

    public EstablecimientoResponseDTO toResponse(Establecimiento establecimiento) {
        if (establecimiento == null) {
            return null;
        }

        EstablecimientoResponseDTO dto = new EstablecimientoResponseDTO();
        dto.setInstitutoId(establecimiento.getInstitutoId());
        dto.setNombre(establecimiento.getNombre());
        dto.setDireccion(establecimiento.getDireccion());
        dto.setNombreDirector(establecimiento.getNombreDirector());
        dto.setTelefono(establecimiento.getTelefono());
        dto.setJornada(establecimiento.getJornada());
        return dto;
    }
}
