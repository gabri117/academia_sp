package com.academia.academia.mapper.pagos;

import com.academia.academia.dto.pagos.DetalleReciboResponseDTO;
import com.academia.academia.entity.Cargo;
import com.academia.academia.entity.DetalleRecibo;
import com.academia.academia.entity.Recibo;
import com.academia.academia.entity.id.DetalleReciboId;
import org.springframework.stereotype.Component;

@Component
public class DetalleReciboMapper {

    public DetalleReciboResponseDTO toResponse(DetalleRecibo detalleRecibo) {
        if (detalleRecibo == null) {
            return null;
        }

        DetalleReciboResponseDTO response = new DetalleReciboResponseDTO();

        DetalleReciboId id = detalleRecibo.getId();
        if (id != null) {
            response.setReciboId(id.getReciboId());
            response.setCargoId(id.getCargoId());
        }

        if (response.getReciboId() == null) {
            Recibo recibo = detalleRecibo.getRecibo();
            if (recibo != null) {
                response.setReciboId(recibo.getReciboId());
            }
        }

        if (response.getCargoId() == null) {
            Cargo cargo = detalleRecibo.getCargo();
            if (cargo != null) {
                response.setCargoId(cargo.getCargoId());
            }
        }

        response.setMontoAplicado(detalleRecibo.getMontoAplicado());
        return response;
    }
}
