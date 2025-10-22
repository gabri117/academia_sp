package com.academia.academia.mapper;

import com.academia.academia.dto.encargado.EncargadoResponseDTO;
import com.academia.academia.entity.Encargado;
import org.springframework.stereotype.Component;

@Component
public class EncargadoMapper {

    public EncargadoResponseDTO toResponse(Encargado encargado) {
        if (encargado == null) {
            return null;
        }

        EncargadoResponseDTO response = new EncargadoResponseDTO();
        response.setId(encargado.getEncargadoId());
        response.setNombre(encargado.getNombre());
        response.setApellido(encargado.getApellido());
        response.setTelefono(encargado.getTelefono());
        return response;
    }
}
