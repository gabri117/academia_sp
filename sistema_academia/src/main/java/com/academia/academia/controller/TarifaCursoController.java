package com.academia.academia.controller;

import com.academia.academia.dto.pagos.TarifaCursoCreateDTO;
import com.academia.academia.dto.pagos.TarifaCursoResponseDTO;
import com.academia.academia.dto.pagos.TarifaCursoUpdateDTO;
import com.academia.academia.service.TarifaCursoService;
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
@RequestMapping("/api/v1/tarifas-curso")
@Tag(name = "Pagos", description = "Administración de tarifas de curso")
public class TarifaCursoController {

    private final TarifaCursoService tarifaCursoService;

    public TarifaCursoController(TarifaCursoService tarifaCursoService) {
        this.tarifaCursoService = tarifaCursoService;
    }

    @PostMapping
    @Operation(summary = "Crear tarifa", description = "Crea una tarifa para una oferta de curso")
    @ApiResponse(responseCode = "201", description = "Tarifa creada")
    public ResponseEntity<TarifaCursoResponseDTO> crear(@Valid @RequestBody TarifaCursoCreateDTO dto) {
        TarifaCursoResponseDTO response = tarifaCursoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{tarifaId}")
    @Operation(summary = "Actualizar tarifa", description = "Actualiza una tarifa existente")
    @ApiResponse(responseCode = "200", description = "Tarifa actualizada")
    public TarifaCursoResponseDTO actualizar(
            @PathVariable UUID tarifaId,
            @Valid @RequestBody TarifaCursoUpdateDTO dto) {
        return tarifaCursoService.actualizar(tarifaId, dto);
    }

    @GetMapping("/{tarifaId}")
    @Operation(summary = "Obtener tarifa", description = "Recupera una tarifa específica")
    @ApiResponse(responseCode = "200", description = "Tarifa encontrada")
    public TarifaCursoResponseDTO obtener(@PathVariable UUID tarifaId) {
        return tarifaCursoService.obtener(tarifaId);
    }

    @DeleteMapping("/{tarifaId}")
    @Operation(summary = "Eliminar tarifa", description = "Elimina la tarifa indicada")
    @ApiResponse(responseCode = "204", description = "Tarifa eliminada")
    public ResponseEntity<Void> eliminar(@PathVariable UUID tarifaId) {
        tarifaCursoService.eliminar(tarifaId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/oferta/{ofertaId}")
    @Operation(summary = "Listar tarifas por oferta", description = "Devuelve las tarifas de una oferta")
    @ApiResponse(responseCode = "200", description = "Tarifas encontradas")
    public List<TarifaCursoResponseDTO> listarPorOferta(@PathVariable UUID ofertaId) {
        return tarifaCursoService.listarPorOferta(ofertaId);
    }
}
