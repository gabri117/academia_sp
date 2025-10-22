package com.academia.academia.repository;

import com.academia.academia.entity.SesionClase;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SesionClaseRepository extends JpaRepository<SesionClase, UUID> {

    List<SesionClase> findByOferta_OfertaId(UUID ofertaId);

    List<SesionClase> findByOferta_OfertaIdAndFechaBetween(UUID ofertaId, LocalDate desde, LocalDate hasta);
}
