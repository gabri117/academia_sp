package com.academia.academia.controller;

import com.academia.academia.dto.oferta.OfertaCursoCreateDTO;
import com.academia.academia.dto.oferta.OfertaCursoResponseDTO;
import com.academia.academia.dto.oferta.OfertaCursoUpdateDTO;
import com.academia.academia.service.OfertaCursoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ofertas-curso")
@Tag(name = "Catálogo / Ofertas / Inscripciones", description = "Operaciones sobre ofertas académicas")
public class OfertaCursoController {

    private final OfertaCursoService ofertaCursoService;

    public OfertaCursoController(OfertaCursoService ofertaCursoService) {
        this.ofertaCursoService = ofertaCursoService;
    }

    @GetMapping
    @Operation(summary = "Listar ofertas", description = "Obtiene ofertas de curso filtrando por grado, instituto o curso")
    @ApiResponse(responseCode = "200", description = "Listado de ofertas")
    public Page<OfertaCursoResponseDTO> listar(
            @RequestParam(required = false) UUID gradoId,
            @RequestParam(required = false) UUID institutoId,
            @RequestParam(required = false) UUID cursoId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ofertaCursoService.listar(gradoId, institutoId, cursoId, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener oferta", description = "Recupera una oferta de curso concreta")
    @ApiResponse(responseCode = "200", description = "Oferta encontrada")
    public OfertaCursoResponseDTO obtener(@PathVariable UUID id) {
        return ofertaCursoService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Crear oferta", description = "Registra una nueva oferta de curso")
    @ApiResponse(responseCode = "201", description = "Oferta creada")
    public ResponseEntity<OfertaCursoResponseDTO> crear(@Valid @RequestBody OfertaCursoCreateDTO dto) {
        OfertaCursoResponseDTO response = ofertaCursoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar oferta", description = "Actualiza una oferta de curso existente")
    @ApiResponse(responseCode = "200", description = "Oferta actualizada")
    public OfertaCursoResponseDTO actualizar(
            @PathVariable UUID id, @Valid @RequestBody OfertaCursoUpdateDTO dto) {
        return ofertaCursoService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar oferta", description = "Elimina una oferta de curso")
    @ApiResponse(responseCode = "204", description = "Oferta eliminada")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        ofertaCursoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
