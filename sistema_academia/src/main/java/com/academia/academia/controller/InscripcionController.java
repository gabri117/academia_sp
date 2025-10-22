package com.academia.academia.controller;

import com.academia.academia.dto.inscripcion.InscripcionCreateDTO;
import com.academia.academia.dto.inscripcion.InscripcionResponseDTO;
import com.academia.academia.dto.inscripcion.InscripcionUpdateDTO;
import com.academia.academia.service.InscripcionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
@RequestMapping("/api/v1/inscripciones")
@Tag(name = "Catálogo / Ofertas / Inscripciones", description = "Gestión de inscripciones de alumnos")
public class InscripcionController {

    private final InscripcionService inscripcionService;

    public InscripcionController(InscripcionService inscripcionService) {
        this.inscripcionService = inscripcionService;
    }

    @GetMapping
    @Operation(summary = "Listar inscripciones", description = "Devuelve las inscripciones de forma paginada")
    @ApiResponse(responseCode = "200", description = "Listado de inscripciones")
    public Page<InscripcionResponseDTO> listar(@PageableDefault(size = 20) Pageable pageable) {
        return inscripcionService.listar(pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener inscripcion", description = "Devuelve la inscripcion indicada")
    @ApiResponse(responseCode = "200", description = "Inscripcion encontrada")
    public InscripcionResponseDTO obtener(@PathVariable UUID id) {
        return inscripcionService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Inscribir alumno", description = "Registra una nueva inscripción para un alumno")
    @ApiResponse(responseCode = "201", description = "Inscripción creada")
    public ResponseEntity<InscripcionResponseDTO> inscribir(@Valid @RequestBody InscripcionCreateDTO dto) {
        InscripcionResponseDTO response = inscripcionService.inscribir(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar inscripción", description = "Actualiza la inscripción indicada")
    @ApiResponse(responseCode = "200", description = "Inscripción actualizada")
    public InscripcionResponseDTO actualizar(
            @PathVariable UUID id, @Valid @RequestBody InscripcionUpdateDTO dto) {
        return inscripcionService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar inscripción", description = "Elimina la inscripción indicada")
    @ApiResponse(responseCode = "204", description = "Inscripción eliminada")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        inscripcionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/alumno/{alumnoId}")
    @Operation(summary = "Inscripciones por alumno", description = "Listado de inscripciones del alumno indicado")
    @ApiResponse(responseCode = "200", description = "Listado de inscripciones del alumno")
    public List<InscripcionResponseDTO> listarPorAlumno(@PathVariable UUID alumnoId) {
        return inscripcionService.listarPorAlumno(alumnoId);
    }

    @GetMapping("/oferta/{ofertaId}")
    @Operation(summary = "Inscripciones por oferta", description = "Listado de inscripciones para la oferta indicada")
    @ApiResponse(responseCode = "200", description = "Listado de inscripciones de la oferta")
    public List<InscripcionResponseDTO> listarPorOferta(@PathVariable UUID ofertaId) {
        return inscripcionService.listarPorOferta(ofertaId);
    }
}
