package com.academia.academia.mapper;

import com.academia.academia.dto.asistencia.AsistenciaResponseDTO;
import com.academia.academia.entity.Asistencia;
import com.academia.academia.entity.Inscripcion;
import com.academia.academia.entity.SesionClase;
import com.academia.academia.entity.id.AsistenciaId;
import org.springframework.stereotype.Component;

@Component
public class AsistenciaMapper {

    public AsistenciaResponseDTO toResponse(Asistencia asistencia) {
        if (asistencia == null) {
            return null;
        }

        AsistenciaResponseDTO response = new AsistenciaResponseDTO();

        AsistenciaId id = asistencia.getId();
        if (id != null) {
            response.setSessionId(id.getSessionId());
            response.setInscripcionId(id.getInscripcionId());
        }

        if (response.getSessionId() == null) {
            SesionClase sesion = asistencia.getSesion();
            if (sesion != null) {
                response.setSessionId(sesion.getSessionId());
            }
        }

        if (response.getInscripcionId() == null) {
            Inscripcion inscripcion = asistencia.getInscripcion();
            if (inscripcion != null) {
                response.setInscripcionId(inscripcion.getInscripcionId());
            }
        }

        response.setPresente(asistencia.isPresente());
        return response;
    }
}
