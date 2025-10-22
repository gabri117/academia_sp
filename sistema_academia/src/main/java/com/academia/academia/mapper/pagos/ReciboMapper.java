package com.academia.academia.mapper.pagos;

import com.academia.academia.dto.pagos.ReciboResponseDTO;
import com.academia.academia.entity.Alumno;
import com.academia.academia.entity.Recibo;
import org.springframework.stereotype.Component;

@Component
public class ReciboMapper {

    public ReciboResponseDTO toResponse(Recibo recibo) {
        if (recibo == null) {
            return null;
        }

        ReciboResponseDTO response = new ReciboResponseDTO();
        response.setReciboId(recibo.getReciboId());

        Alumno alumno = recibo.getAlumno();
        if (alumno != null) {
            response.setAlumnoId(alumno.getAlumnoId());
        }

        response.setCorrelativoRecibo(recibo.getCorrelativoRecibo());
        response.setFecha(recibo.getFecha());
        response.setTotal(recibo.getTotal());
        response.setEstado(recibo.getEstado());
        return response;
    }
}
