package com.academia.academia.mapper;

import com.academia.academia.dto.oferta.CursoCatalogoResponseDTO;
import com.academia.academia.entity.CursoCatalogo;
import org.springframework.stereotype.Component;

@Component
public class CursoMapper {

    public CursoCatalogoResponseDTO toResponse(CursoCatalogo cursoCatalogo) {
        if (cursoCatalogo == null) {
            return null;
        }

        CursoCatalogoResponseDTO response = new CursoCatalogoResponseDTO();
        response.setId(cursoCatalogo.getCursoId());
        response.setNombre(cursoCatalogo.getNombre());
        response.setNivelCurso(cursoCatalogo.getNivelCurso());
        response.setDuracion(cursoCatalogo.getDuracion());
        return response;
    }
}
