package com.academia.academia.controller;

import com.academia.academia.dto.sesiones.SesionClaseCreateDTO;
import com.academia.academia.dto.sesiones.SesionClaseResponseDTO;
import com.academia.academia.service.SesionClaseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/sesiones-clase")
@Tag(name = "Sesiones y Asistencia", description = "Gestión de sesiones de clase")
public class SesionClaseController {

    private final SesionClaseService sesionClaseService;

    public SesionClaseController(SesionClaseService sesionClaseService) {
        this.sesionClaseService = sesionClaseService;
    }

    @PostMapping
    @Operation(summary = "Crear sesión de clase", description = "Programa una nueva sesión a partir de una oferta")
    @ApiResponse(responseCode = "201", description = "Sesión creada")
    public ResponseEntity<SesionClaseResponseDTO> crear(@Valid @RequestBody SesionClaseCreateDTO dto) {
        SesionClaseResponseDTO response = sesionClaseService.crearSesion(dto.getOfertaId(), dto.getFecha());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/oferta/{ofertaId}")
    @Operation(summary = "Listar sesiones por oferta", description = "Devuelve las sesiones asociadas a una oferta")
    @ApiResponse(responseCode = "200", description = "Sesiones encontradas")
    public List<SesionClaseResponseDTO> listarPorOferta(@PathVariable UUID ofertaId) {
        return sesionClaseService.listarPorOferta(ofertaId);
    }

    @GetMapping("/oferta/{ofertaId}/rango")
    @Operation(summary = "Listar sesiones por rango de fechas", description = "Devuelve sesiones en un periodo específico")
    @ApiResponse(responseCode = "200", description = "Sesiones en el rango solicitado")
    public List<SesionClaseResponseDTO> listarPorRango(
            @PathVariable UUID ofertaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return sesionClaseService.listarPorRangoFecha(ofertaId, desde, hasta);
    }
}
