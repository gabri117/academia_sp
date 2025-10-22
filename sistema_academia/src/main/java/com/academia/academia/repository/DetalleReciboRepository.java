package com.academia.academia.repository;

import com.academia.academia.entity.DetalleRecibo;
import com.academia.academia.entity.id.DetalleReciboId;
import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DetalleReciboRepository extends JpaRepository<DetalleRecibo, DetalleReciboId> {

    List<DetalleRecibo> findByCargo_CargoId(UUID cargoId);

    List<DetalleRecibo> findByRecibo_ReciboId(UUID reciboId);
}
