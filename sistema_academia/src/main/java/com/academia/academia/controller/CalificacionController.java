package com.academia.academia.controller;

import com.academia.academia.dto.calificacion.CalificacionCreateDTO;
import com.academia.academia.dto.calificacion.CalificacionResponseDTO;
import com.academia.academia.service.CalificacionService;
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
@RequestMapping("/api/v1/calificaciones")
@Tag(name = "Evaluaciones y Calificaciones", description = "Registro y consulta de calificaciones")
public class CalificacionController {

    private final CalificacionService calificacionService;

    public CalificacionController(CalificacionService calificacionService) {
        this.calificacionService = calificacionService;
    }

    @PostMapping
    @Operation(summary = "Registrar calificación", description = "Registra la calificación de una unidad para un alumno")
    @ApiResponse(responseCode = "201", description = "Calificación registrada")
    public ResponseEntity<CalificacionResponseDTO> registrar(@Valid @RequestBody CalificacionCreateDTO dto) {
        CalificacionResponseDTO response = calificacionService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/inscripcion/{inscripcionId}")
    @Operation(summary = "Listar calificaciones por inscripción", description = "Obtiene calificaciones registradas para una inscripción")
    @ApiResponse(responseCode = "200", description = "Calificaciones encontradas")
    public List<CalificacionResponseDTO> listarPorInscripcion(@PathVariable UUID inscripcionId) {
        return calificacionService.listarPorInscripcion(inscripcionId);
    }

    @GetMapping("/oferta/{ofertaId}")
    @Operation(summary = "Listar calificaciones por oferta", description = "Obtiene calificaciones registradas para una oferta")
    @ApiResponse(responseCode = "200", description = "Calificaciones asociadas a la oferta")
    public List<CalificacionResponseDTO> listarPorOferta(@PathVariable UUID ofertaId) {
        return calificacionService.listarPorOferta(ofertaId);
    }
}
