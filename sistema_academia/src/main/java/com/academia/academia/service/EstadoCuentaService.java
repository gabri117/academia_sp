package com.academia.academia.service;

import com.academia.academia.dto.pagos.EstadoCuentaResponseDTO;
import java.util.UUID;

public interface EstadoCuentaService {

    EstadoCuentaResponseDTO consolidarPorAlumno(UUID alumnoId);
}
