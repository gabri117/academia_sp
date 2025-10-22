package com.academia.academia.controller;

import com.academia.academia.dto.pagos.CargoCreateDTO;
import com.academia.academia.dto.pagos.CargoResponseDTO;
import com.academia.academia.dto.pagos.CargoUpdateDTO;
import com.academia.academia.service.CargoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cargos")
@Tag(name = "Pagos", description = "Gestión de cargos y su estado")
public class CargoController {

    private final CargoService cargoService;

    public CargoController(CargoService cargoService) {
        this.cargoService = cargoService;
    }

    @PostMapping
    @Operation(summary = "Crear cargo", description = "Crea un nuevo cargo asociado a una tarifa")
    @ApiResponse(responseCode = "201", description = "Cargo creado")
    public ResponseEntity<CargoResponseDTO> crear(@Valid @RequestBody CargoCreateDTO dto) {
        CargoResponseDTO response = cargoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{cargoId}")
    @Operation(summary = "Actualizar cargo", description = "Actualiza los datos de un cargo")
    @ApiResponse(responseCode = "200", description = "Cargo actualizado")
    public CargoResponseDTO actualizar(
            @PathVariable UUID cargoId,
            @Valid @RequestBody CargoUpdateDTO dto) {
        return cargoService.actualizar(cargoId, dto);
    }

    @GetMapping("/{cargoId}")
    @Operation(summary = "Obtener cargo", description = "Obtiene la información de un cargo específico")
    @ApiResponse(responseCode = "200", description = "Cargo encontrado")
    public CargoResponseDTO obtener(@PathVariable UUID cargoId) {
        return cargoService.obtener(cargoId);
    }

    @DeleteMapping("/{cargoId}")
    @Operation(summary = "Eliminar cargo", description = "Elimina el cargo indicado")
    @ApiResponse(responseCode = "204", description = "Cargo eliminado")
    public ResponseEntity<Void> eliminar(@PathVariable UUID cargoId) {
        cargoService.eliminar(cargoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tarifa/{tarifaId}")
    @Operation(summary = "Listar cargos por tarifa", description = "Devuelve los cargos asociados a una tarifa")
    @ApiResponse(responseCode = "200", description = "Cargos encontrados")
    public List<CargoResponseDTO> listarPorTarifa(@PathVariable UUID tarifaId) {
        return cargoService.listarPorTarifa(tarifaId);
    }

    @PostMapping("/{cargoId}/recalcular")
    @Operation(summary = "Recalcular estado del cargo", description = "Actualiza el estado del cargo considerando pagos aplicados")
    @ApiResponse(responseCode = "200", description = "Cargo recalculado")
    public CargoResponseDTO recalcular(@PathVariable UUID cargoId) {
        return cargoService.recalcularEstado(cargoId);
    }
}
