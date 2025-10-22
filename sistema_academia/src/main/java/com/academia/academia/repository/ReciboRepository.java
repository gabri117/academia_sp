package com.academia.academia.repository;

import com.academia.academia.dto.pagos.ReciboOfertaFlat;
import com.academia.academia.entity.Recibo;
import com.academia.academia.entity.enums.ReciboEstado;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReciboRepository extends JpaRepository<Recibo, UUID> {

    List<Recibo> findByAlumno_AlumnoId(UUID alumnoId);

    @Query(
            """
            select new com.academia.academia.dto.pagos.ReciboOfertaFlat(
                r.reciboId,
                r.alumno.alumnoId,
                r.correlativoRecibo,
                r.fecha,
                r.estado,
                r.total,
                o.ofertaId,
                cc.nombre,
                o.dia,
                o.horaInicio,
                o.horaFinalizacion,
                e.institutoId,
                e.nombre
            )
            from Recibo r
            left join DetalleRecibo dr on dr.recibo = r
            left join dr.cargo c
            left join c.tarifa t
            left join t.oferta o
            left join o.cursoCatalogo cc
            left join o.establecimiento e
            where (coalesce(:alumnoId, r.alumno.alumnoId) = r.alumno.alumnoId)
              and (coalesce(:estado, r.estado) = r.estado)
              and (:fechaDesde is null or r.fecha >= :fechaDesde)
              and (:fechaHasta is null or r.fecha <= :fechaHasta)
            order by r.fecha desc, r.correlativoRecibo asc
            """)
    List<ReciboOfertaFlat> findRecibosConOfertas(
            @Param("alumnoId") UUID alumnoId,
            @Param("estado") ReciboEstado estado,
            @Param("fechaDesde") java.time.LocalDate fechaDesde,
            @Param("fechaHasta") java.time.LocalDate fechaHasta);
}
