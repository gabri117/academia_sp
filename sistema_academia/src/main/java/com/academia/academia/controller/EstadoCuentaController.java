package com.academia.academia.controller;

import com.academia.academia.dto.pagos.EstadoCuentaResponseDTO;
import com.academia.academia.service.EstadoCuentaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/alumnos/{alumnoId}/estado-cuenta")
@Tag(name = "Pagos", description = "Consolidado de estado de cuenta")
public class EstadoCuentaController {

    private final EstadoCuentaService estadoCuentaService;

    public EstadoCuentaController(EstadoCuentaService estadoCuentaService) {
        this.estadoCuentaService = estadoCuentaService;
    }

    @GetMapping
    @Operation(summary = "Consultar estado de cuenta", description = "Consolida cargos, pagos y saldo para un alumno")
    @ApiResponse(responseCode = "200", description = "Estado de cuenta generado")
    public EstadoCuentaResponseDTO obtener(@PathVariable UUID alumnoId) {
        return estadoCuentaService.consolidarPorAlumno(alumnoId);
    }
}
