package com.academia.academia.mapper;

import com.academia.academia.dto.oferta.OfertaCursoResponseDTO;
import com.academia.academia.entity.CursoCatalogo;
import com.academia.academia.entity.Establecimiento;
import com.academia.academia.entity.GradoAcademico;
import com.academia.academia.entity.OfertaCurso;
import org.springframework.stereotype.Component;

@Component
public class OfertaMapper {

    public OfertaCursoResponseDTO toResponse(OfertaCurso ofertaCurso) {
        if (ofertaCurso == null) {
            return null;
        }

        OfertaCursoResponseDTO response = new OfertaCursoResponseDTO();
        response.setId(ofertaCurso.getOfertaId());

        GradoAcademico gradoAcademico = ofertaCurso.getGradoAcademico();
        if (gradoAcademico != null) {
            response.setGradoId(gradoAcademico.getGradoId());
        }

        Establecimiento establecimiento = ofertaCurso.getEstablecimiento();
        if (establecimiento != null) {
            response.setInstitutoId(establecimiento.getInstitutoId());
        }

        CursoCatalogo cursoCatalogo = ofertaCurso.getCursoCatalogo();
        if (cursoCatalogo != null) {
            response.setCursoId(cursoCatalogo.getCursoId());
        }

        response.setDia(ofertaCurso.getDia());
        response.setHoraInicio(ofertaCurso.getHoraInicio());
        response.setHoraFinalizacion(ofertaCurso.getHoraFinalizacion());
        response.setFechaInicio(ofertaCurso.getFechaInicio());
        response.setFechaFinalizacion(ofertaCurso.getFechaFinalizacion());
        response.setCapacidad(ofertaCurso.getCapacidad() != null ? ofertaCurso.getCapacidad() : 0);
        response.setStatus(ofertaCurso.getStatus());
        return response;
    }
}
