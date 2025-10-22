package com.academia.academia.mapper;

import com.academia.academia.dto.inscripcion.InscripcionResponseDTO;
import com.academia.academia.entity.Alumno;
import com.academia.academia.entity.Inscripcion;
import com.academia.academia.entity.OfertaCurso;
import org.springframework.stereotype.Component;

@Component
public class InscripcionMapper {

    public InscripcionResponseDTO toResponse(Inscripcion inscripcion) {
        if (inscripcion == null) {
            return null;
        }

        InscripcionResponseDTO response = new InscripcionResponseDTO();
        response.setId(inscripcion.getInscripcionId());

        Alumno alumno = inscripcion.getAlumno();
        if (alumno != null) {
            response.setAlumnoId(alumno.getAlumnoId());
        }

        OfertaCurso ofertaCurso = inscripcion.getOferta();
        if (ofertaCurso != null) {
            response.setOfertaId(ofertaCurso.getOfertaId());
        }

        response.setFechaInscripcion(inscripcion.getFechaInscripcion());
        response.setEstado(inscripcion.getEstado());
        return response;
    }
}
