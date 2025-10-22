package com.academia.academia.controller;

import com.academia.academia.dto.oferta.CursoCatalogoCreateDTO;
import com.academia.academia.dto.oferta.CursoCatalogoResponseDTO;
import com.academia.academia.dto.oferta.CursoCatalogoUpdateDTO;
import com.academia.academia.service.CursoCatalogoService;
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
@RequestMapping("/api/v1/cursos-catalogo")
@Tag(name = "Catálogo / Ofertas / Inscripciones", description = "Gestión del catálogo de cursos")
public class CursoCatalogoController {

    private final CursoCatalogoService cursoCatalogoService;

    public CursoCatalogoController(CursoCatalogoService cursoCatalogoService) {
        this.cursoCatalogoService = cursoCatalogoService;
    }

    @GetMapping
    @Operation(summary = "Listar cursos del catálogo", description = "Devuelve cursos del catálogo filtrando opcionalmente por nombre")
    @ApiResponse(responseCode = "200", description = "Listado de cursos de catálogo")
    public Page<CursoCatalogoResponseDTO> listar(
            @RequestParam(required = false) String nombre,
            @PageableDefault(size = 20) Pageable pageable) {
        return cursoCatalogoService.listar(nombre, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener curso del catálogo", description = "Recupera la información de un curso del catálogo")
    @ApiResponse(responseCode = "200", description = "Curso encontrado")
    public CursoCatalogoResponseDTO obtener(@PathVariable UUID id) {
        return cursoCatalogoService.obtener(id);
    }

    @PostMapping
    @Operation(summary = "Crear curso del catálogo", description = "Registra un nuevo curso en el catálogo")
    @ApiResponse(responseCode = "201", description = "Curso creado")
    public ResponseEntity<CursoCatalogoResponseDTO> crear(@Valid @RequestBody CursoCatalogoCreateDTO dto) {
        CursoCatalogoResponseDTO response = cursoCatalogoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar curso del catálogo", description = "Actualiza un curso existente del catálogo")
    @ApiResponse(responseCode = "200", description = "Curso actualizado")
    public CursoCatalogoResponseDTO actualizar(
            @PathVariable UUID id, @Valid @RequestBody CursoCatalogoUpdateDTO dto) {
        return cursoCatalogoService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar curso del catálogo", description = "Elimina un curso del catálogo")
    @ApiResponse(responseCode = "204", description = "Curso eliminado")
    public ResponseEntity<Void> eliminar(@PathVariable UUID id) {
        cursoCatalogoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
