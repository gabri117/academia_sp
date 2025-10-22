package com.academia.academia.mapper.pagos;

import com.academia.academia.dto.pagos.CargoResponseDTO;
import com.academia.academia.entity.Cargo;
import com.academia.academia.entity.TarifaCurso;
import org.springframework.stereotype.Component;

@Component
public class CargoMapper {

    public CargoResponseDTO toResponse(Cargo cargo) {
        if (cargo == null) {
            return null;
        }

        CargoResponseDTO response = new CargoResponseDTO();
        response.setCargoId(cargo.getCargoId());

        TarifaCurso tarifa = cargo.getTarifa();
        if (tarifa != null) {
            response.setTarifaId(tarifa.getTarifaId());
        }

        response.setPeriodoMes(cargo.getPeriodoMes());
        response.setConcepto(cargo.getConcepto());
        response.setMonto(cargo.getMonto());
        response.setEstado(cargo.getEstado());
        return response;
    }
}
