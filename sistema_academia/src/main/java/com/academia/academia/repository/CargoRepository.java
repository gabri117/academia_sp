package com.academia.academia.repository;

import com.academia.academia.entity.Cargo;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CargoRepository extends JpaRepository<Cargo, UUID> {

    @Query(
            value = """
                    SELECT EXISTS (
                        SELECT 1
                        FROM cargo c
                        WHERE c.tarifa_id = :tarifaId
                          AND c.periodo_mes = CAST(:periodoMes AS mes_enum)
                          AND c.concepto = :concepto
                    )
                    """,
            nativeQuery = true)
    boolean existsByTarifa_TarifaIdAndPeriodoMesAndConcepto(
            @Param("tarifaId") UUID tarifaId,
            @Param("periodoMes") String periodoMes,
            @Param("concepto") String concepto);

    List<Cargo> findByTarifa_TarifaId(UUID tarifaId);

    List<Cargo> findByTarifa_Oferta_OfertaId(UUID ofertaId);
}
