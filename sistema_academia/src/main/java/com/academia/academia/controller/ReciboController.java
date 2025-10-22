package com.academia.academia.controller;

import com.academia.academia.dto.pagos.ReciboConOfertasDTO;
import com.academia.academia.dto.pagos.ReciboCreateDTO;
import com.academia.academia.dto.pagos.ReciboResponseDTO;
import com.academia.academia.dto.pagos.ReciboUpdateDTO;
import com.academia.academia.entity.enums.ReciboEstado;
import com.academia.academia.service.ReciboService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/recibos")
@Tag(name = "Pagos", description = "Registro y consulta de recibos")
public class ReciboController {

    private final ReciboService reciboService;

    public ReciboController(ReciboService reciboService) {
        this.reciboService = reciboService;
    }

    @PostMapping
    @Operation(summary = "Registrar recibo", description = "Crea un nuevo recibo para un alumno")
    @ApiResponse(responseCode = "201", description = "Recibo registrado")
    public ResponseEntity<ReciboResponseDTO> registrar(@Valid @RequestBody ReciboCreateDTO dto) {
        ReciboResponseDTO response = reciboService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(
            summary = "Listar recibos con ofertas",
            description = "Devuelve los recibos junto con la informacion de las ofertas asociadas. "
                    + "Permite filtrar por alumno, estado y rango de fechas.",
            parameters = {
                    @Parameter(name = "alumnoId", description = "Identificador del alumno", required = false),
                    @Parameter(name = "estado", description = "Estado actual del recibo", required = false),
                    @Parameter(
                            name = "fechaDesde",
                            description = "Fecha inicial (inclusive) con formato yyyy-MM-dd",
                            required = false),
                    @Parameter(
                            name = "fechaHasta",
                            description = "Fecha final (inclusive) con formato yyyy-MM-dd",
                            required = false)
            })
    @ApiResponse(responseCode = "200", description = "Recibos encontrados")
    public List<ReciboConOfertasDTO> listar(
            @RequestParam(name = "alumnoId", required = false) UUID alumnoId,
            @RequestParam(name = "estado", required = false) ReciboEstado estado,
            @RequestParam(name = "fechaDesde", required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate fechaDesde,
            @RequestParam(name = "fechaHasta", required = false)
                    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
                    LocalDate fechaHasta) {
        return reciboService.buscarRecibosConOfertas(alumnoId, estado, fechaDesde, fechaHasta);
    }

    @GetMapping("/alumno/{alumnoId}")
    @Operation(summary = "Listar recibos por alumno", description = "Obtiene los recibos emitidos a un alumno")
    @ApiResponse(responseCode = "200", description = "Recibos encontrados")
    public List<ReciboResponseDTO> listarPorAlumno(@PathVariable UUID alumnoId) {
        return reciboService.listarPorAlumno(alumnoId);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener recibo por ID", description = "Devuelve los datos de un recibo especifico")
    @ApiResponse(responseCode = "200", description = "Recibo encontrado")
    @ApiResponse(responseCode = "404", description = "Recibo no encontrado")
    public ResponseEntity<ReciboResponseDTO> obtenerPorId(@PathVariable UUID id) {
        ReciboResponseDTO recibo = reciboService.obtenerPorId(id);
        return ResponseEntity.ok(recibo);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar recibo", description = "Modifica los datos de un recibo existente")
    public ResponseEntity<ReciboResponseDTO> actualizar(
            @PathVariable UUID id,
            @Valid @RequestBody ReciboUpdateDTO dto) {
        ReciboResponseDTO actualizado = reciboService.actualizar(id, dto);
        return ResponseEntity.ok(actualizado);
    }
}

