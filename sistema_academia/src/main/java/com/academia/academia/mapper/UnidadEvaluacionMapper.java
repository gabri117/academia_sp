package com.academia.academia.mapper;

import com.academia.academia.dto.evaluacion.UnidadEvaluacionResponseDTO;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.UnidadEvaluacion;
import org.springframework.stereotype.Component;

@Component
public class UnidadEvaluacionMapper {

    public UnidadEvaluacionResponseDTO toResponse(UnidadEvaluacion unidadEvaluacion) {
        if (unidadEvaluacion == null) {
            return null;
        }

        UnidadEvaluacionResponseDTO response = new UnidadEvaluacionResponseDTO();
        response.setEvaluacionId(unidadEvaluacion.getEvaluacionId());

        OfertaCurso oferta = unidadEvaluacion.getOferta();
        if (oferta != null) {
            response.setOfertaId(oferta.getOfertaId());
        }

        response.setNombre(unidadEvaluacion.getNombre());
        return response;
    }
}
