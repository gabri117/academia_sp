package com.academia.academia.repository;

import com.academia.academia.entity.Asistencia;
import com.academia.academia.entity.id.AsistenciaId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AsistenciaRepository extends JpaRepository<Asistencia, AsistenciaId> {

    List<Asistencia> findBySesion_SessionId(UUID sessionId);

    List<Asistencia> findByInscripcion_InscripcionId(UUID inscripcionId);
}
