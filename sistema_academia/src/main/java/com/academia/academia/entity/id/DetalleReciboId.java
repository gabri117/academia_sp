package com.academia.academia.entity.id;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class DetalleReciboId implements Serializable {

    @Column(name = "recibo_id", nullable = false)
    private UUID reciboId;

    @Column(name = "cargo_id", nullable = false)
    private UUID cargoId;

    public DetalleReciboId() {
    }

    public DetalleReciboId(UUID reciboId, UUID cargoId) {
        this.reciboId = reciboId;
        this.cargoId = cargoId;
    }

    public UUID getReciboId() {
        return reciboId;
    }

    public void setReciboId(UUID reciboId) {
        this.reciboId = reciboId;
    }

    public UUID getCargoId() {
        return cargoId;
    }

    public void setCargoId(UUID cargoId) {
        this.cargoId = cargoId;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (o == null || getClass() != o.getClass()) {
            return false;
        }
        DetalleReciboId that = (DetalleReciboId) o;
        return Objects.equals(reciboId, that.reciboId)
            && Objects.equals(cargoId, that.cargoId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(reciboId, cargoId);
    }
}

