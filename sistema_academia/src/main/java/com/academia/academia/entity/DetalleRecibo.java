package com.academia.academia.entity;

import com.academia.academia.entity.id.DetalleReciboId;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "detallerecibo")
public class DetalleRecibo {

    @EmbeddedId
    private DetalleReciboId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("reciboId")
    @JoinColumn(name = "recibo_id", nullable = false)
    private Recibo recibo;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("cargoId")
    @JoinColumn(name = "cargo_id", nullable = false)
    private Cargo cargo;

    @Column(name = "monto_aplicado", nullable = false, precision = 10, scale = 2)
    private BigDecimal montoAplicado;

    public DetalleReciboId getId() {
        return id;
    }

    public void setId(DetalleReciboId id) {
        this.id = id;
    }

    public Recibo getRecibo() {
        return recibo;
    }

    public void setRecibo(Recibo recibo) {
        this.recibo = recibo;
    }

    public Cargo getCargo() {
        return cargo;
    }

    public void setCargo(Cargo cargo) {
        this.cargo = cargo;
    }

    public BigDecimal getMontoAplicado() {
        return montoAplicado;
    }

    public void setMontoAplicado(BigDecimal montoAplicado) {
        this.montoAplicado = montoAplicado;
    }
}

