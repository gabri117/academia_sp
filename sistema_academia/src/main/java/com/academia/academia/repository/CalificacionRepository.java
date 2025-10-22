package com.academia.academia.repository;

import com.academia.academia.entity.Calificacion;
import com.academia.academia.entity.id.CalificacionId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CalificacionRepository extends JpaRepository<Calificacion, CalificacionId> {

    List<Calificacion> findByInscripcion_InscripcionId(UUID inscripcionId);

    List<Calificacion> findByUnidadEvaluacion_Oferta_OfertaId(UUID ofertaId);
}
