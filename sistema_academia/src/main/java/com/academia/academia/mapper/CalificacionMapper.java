package com.academia.academia.mapper;

import com.academia.academia.dto.calificacion.CalificacionResponseDTO;
import com.academia.academia.entity.Calificacion;
import com.academia.academia.entity.Inscripcion;
import com.academia.academia.entity.UnidadEvaluacion;
import com.academia.academia.entity.id.CalificacionId;
import org.springframework.stereotype.Component;

@Component
public class CalificacionMapper {

    public CalificacionResponseDTO toResponse(Calificacion calificacion) {
        if (calificacion == null) {
            return null;
        }

        CalificacionResponseDTO response = new CalificacionResponseDTO();

        CalificacionId id = calificacion.getId();
        if (id != null) {
            response.setInscripcionId(id.getInscripcionId());
            response.setEvaluacionId(id.getEvaluacionId());
        }

        if (response.getInscripcionId() == null) {
            Inscripcion inscripcion = calificacion.getInscripcion();
            if (inscripcion != null) {
                response.setInscripcionId(inscripcion.getInscripcionId());
            }
        }

        if (response.getEvaluacionId() == null) {
            UnidadEvaluacion unidad = calificacion.getUnidadEvaluacion();
            if (unidad != null) {
                response.setEvaluacionId(unidad.getEvaluacionId());
            }
        }

        response.setNota(calificacion.getNota());
        response.setObservaciones(calificacion.getObservaciones());
        return response;
    }
}
