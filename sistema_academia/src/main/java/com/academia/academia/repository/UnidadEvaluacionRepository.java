package com.academia.academia.repository;

import com.academia.academia.entity.UnidadEvaluacion;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UnidadEvaluacionRepository extends JpaRepository<UnidadEvaluacion, UUID> {

    List<UnidadEvaluacion> findByOferta_OfertaId(UUID ofertaId);
}
