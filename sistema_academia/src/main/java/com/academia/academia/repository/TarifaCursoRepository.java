package com.academia.academia.repository;

import com.academia.academia.entity.TarifaCurso;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TarifaCursoRepository extends JpaRepository<TarifaCurso, UUID> {

    List<TarifaCurso> findByOferta_OfertaId(UUID ofertaId);
}
