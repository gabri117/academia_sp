package com.academia.academia.mapper.pagos;

import com.academia.academia.dto.pagos.TarifaCursoResponseDTO;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.TarifaCurso;
import org.springframework.stereotype.Component;

@Component
public class TarifaCursoMapper {

    public TarifaCursoResponseDTO toResponse(TarifaCurso tarifaCurso) {
        if (tarifaCurso == null) {
            return null;
        }

        TarifaCursoResponseDTO response = new TarifaCursoResponseDTO();
        response.setTarifaId(tarifaCurso.getTarifaId());

        OfertaCurso oferta = tarifaCurso.getOferta();
        if (oferta != null) {
            response.setOfertaId(oferta.getOfertaId());
        }

        response.setMontoInscripcion(tarifaCurso.getMontoInscripcion());
        response.setMontoMensualidad(tarifaCurso.getMontoMensualidad());
        return response;
    }
}
