package com.academia.academia.mapper;

import com.academia.academia.dto.sesiones.SesionClaseResponseDTO;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.SesionClase;
import org.springframework.stereotype.Component;

@Component
public class SesionClaseMapper {

    public SesionClaseResponseDTO toResponse(SesionClase sesionClase) {
        if (sesionClase == null) {
            return null;
        }

        SesionClaseResponseDTO response = new SesionClaseResponseDTO();
        response.setSessionId(sesionClase.getSessionId());

        OfertaCurso oferta = sesionClase.getOferta();
        if (oferta != null) {
            response.setOfertaId(oferta.getOfertaId());
        }

        response.setFecha(sesionClase.getFecha());
        return response;
    }
}
