package com.academia.academia.controller;

import com.academia.academia.dto.encargado.AlumnoEncargadoResponseDTO;
import com.academia.academia.dto.encargado.VinculoAlumnoEncargadoRequest;
import com.academia.academia.service.AlumnoEncargadoService;
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
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/alumno-encargado")
@Tag(name = "Personas", description = "Vínculos entre alumnos y encargados")
public class AlumnoEncargadoController {

    private final AlumnoEncargadoService alumnoEncargadoService;

    public AlumnoEncargadoController(AlumnoEncargadoService alumnoEncargadoService) {
        this.alumnoEncargadoService = alumnoEncargadoService;
    }

    @PostMapping
    @Operation(summary = "Vincular alumno y encargado", description = "Crea la relación entre alumno y encargado")
    @ApiResponse(responseCode = "201", description = "Vínculo creado correctamente")
    public ResponseEntity<AlumnoEncargadoResponseDTO> vincular(
            @Valid @RequestBody VinculoAlumnoEncargadoRequest request) {
        AlumnoEncargadoResponseDTO response = alumnoEncargadoService.vincular(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{alumnoId}/{encargadoId}")
    @Operation(summary = "Desvincular alumno y encargado", description = "Elimina la relación entre alumno y encargado")
    @ApiResponse(responseCode = "204", description = "Vínculo eliminado")
    public ResponseEntity<Void> desvincular(
            @PathVariable UUID alumnoId,
            @PathVariable UUID encargadoId) {
        alumnoEncargadoService.desvincular(alumnoId, encargadoId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alumno/{alumnoId}")
    @Operation(summary = "Listar encargados de un alumno", description = "Obtiene los encargados asociados a un alumno")
    @ApiResponse(responseCode = "200", description = "Listado de encargados para el alumno")
    public List<AlumnoEncargadoResponseDTO> listarEncargadosDeAlumno(@PathVariable UUID alumnoId) {
        return alumnoEncargadoService.listarEncargadosDeAlumno(alumnoId);
    }

    @GetMapping("/encargado/{encargadoId}")
    @Operation(summary = "Listar alumnos de un encargado", description = "Obtiene los alumnos asociados a un encargado")
    @ApiResponse(responseCode = "200", description = "Listado de alumnos para el encargado")
    public List<AlumnoEncargadoResponseDTO> listarAlumnosDeEncargado(@PathVariable UUID encargadoId) {
        return alumnoEncargadoService.listarAlumnosDeEncargado(encargadoId);
    }
}
