package com.academia.academia.controller;

import com.academia.academia.dto.evaluacion.UnidadEvaluacionCreateDTO;
import com.academia.academia.dto.evaluacion.UnidadEvaluacionResponseDTO;
import com.academia.academia.service.UnidadEvaluacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/unidades-evaluacion")
@Tag(name = "Evaluaciones y Calificaciones", description = "Gestión de unidades de evaluación")
public class UnidadEvaluacionController {

    private final UnidadEvaluacionService unidadEvaluacionService;

    public UnidadEvaluacionController(UnidadEvaluacionService unidadEvaluacionService) {
        this.unidadEvaluacionService = unidadEvaluacionService;
    }

    @PostMapping
    @Operation(summary = "Crear unidad de evaluación", description = "Registra una nueva unidad asociada a una oferta")
    @ApiResponse(responseCode = "201", description = "Unidad de evaluación creada")
    public ResponseEntity<UnidadEvaluacionResponseDTO> crear(@Valid @RequestBody UnidadEvaluacionCreateDTO dto) {
        UnidadEvaluacionResponseDTO response = unidadEvaluacionService.crearUnidad(dto.getOfertaId(), dto.getNombre());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/oferta/{ofertaId}")
    @Operation(summary = "Listar unidades de evaluación", description = "Listado de unidades de evaluación de una oferta")
    @ApiResponse(responseCode = "200", description = "Unidades de evaluación encontradas")
    public List<UnidadEvaluacionResponseDTO> listarPorOferta(@PathVariable UUID ofertaId) {
        return unidadEvaluacionService.listarPorOferta(ofertaId);
    }
}
