package com.academia.academia.controller;

import com.academia.academia.dto.asistencia.AsistenciaCreateDTO;
import com.academia.academia.dto.asistencia.AsistenciaResponseDTO;
import com.academia.academia.service.AsistenciaService;
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
@RequestMapping("/api/v1/asistencias")
@Tag(name = "Sesiones y Asistencia", description = "Registro y consulta de asistencia")
public class AsistenciaController {

    private final AsistenciaService asistenciaService;

    public AsistenciaController(AsistenciaService asistenciaService) {
        this.asistenciaService = asistenciaService;
    }

    @PostMapping
    @Operation(summary = "Registrar asistencia", description = "Guarda la asistencia de un alumno en una sesión")
    @ApiResponse(responseCode = "201", description = "Asistencia registrada")
    public ResponseEntity<AsistenciaResponseDTO> registrar(@Valid @RequestBody AsistenciaCreateDTO dto) {
        AsistenciaResponseDTO response = asistenciaService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/sesion/{sessionId}")
    @Operation(summary = "Listar asistencia por sesión", description = "Obtiene la asistencia de una sesión específica")
    @ApiResponse(responseCode = "200", description = "Listado de asistencia para la sesión")
    public List<AsistenciaResponseDTO> listarPorSesion(@PathVariable UUID sessionId) {
        return asistenciaService.listarPorSesion(sessionId);
    }

    @GetMapping("/inscripcion/{inscripcionId}")
    @Operation(summary = "Listar asistencia por inscripción", description = "Obtiene la asistencia registrada para una inscripción")
    @ApiResponse(responseCode = "200", description = "Listado de asistencia para la inscripción")
    public List<AsistenciaResponseDTO> listarPorInscripcion(@PathVariable UUID inscripcionId) {
        return asistenciaService.listarPorInscripcion(inscripcionId);
    }
}
