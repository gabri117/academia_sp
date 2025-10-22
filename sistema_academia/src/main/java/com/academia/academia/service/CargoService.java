package com.academia.academia.service;

import com.academia.academia.dto.pagos.CargoCreateDTO;
import com.academia.academia.dto.pagos.CargoResponseDTO;
import com.academia.academia.dto.pagos.CargoUpdateDTO;
import java.util.List;
import java.util.UUID;

public interface CargoService {

    CargoResponseDTO crear(CargoCreateDTO dto);

    CargoResponseDTO actualizar(UUID id, CargoUpdateDTO dto);

    CargoResponseDTO obtener(UUID id);

    void eliminar(UUID id);

    List<CargoResponseDTO> listarPorTarifa(UUID tarifaId);

    CargoResponseDTO recalcularEstado(UUID cargoId);
}
