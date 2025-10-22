package com.academia.academia.entity;

import com.academia.academia.entity.enums.CargoEstado;
import com.academia.academia.entity.enums.Mes;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.math.BigDecimal;
import java.util.UUID;
import org.hibernate.annotations.ColumnTransformer;

@Entity
@Table(
    name = "cargo",
    uniqueConstraints = @UniqueConstraint(name = "uq_cargo_por_mes", columnNames = {"tarifa_id", "periodo_mes", "concepto"})
)
public class Cargo {

    @Id
    @Column(name = "cargo_id", nullable = false)
    private UUID cargoId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tarifa_id", nullable = false)
    private TarifaCurso tarifa;

    @Column(name = "periodo_mes", nullable = false, columnDefinition = "mes_enum")
    @ColumnTransformer(write = "?::mes_enum")
    private Mes periodoMes;

    @Column(name = "concepto", nullable = false, length = 30)
    private String concepto;

    @Column(name = "monto", nullable = false, precision = 10, scale = 2)
    private BigDecimal monto;

    @Column(name = "estado", nullable = false, columnDefinition = "cargo_estado_enum")
    @ColumnTransformer(write = "?::cargo_estado_enum")
    private CargoEstado estado;

    @PrePersist
    public void prePersist() {
        if (cargoId == null) {
            cargoId = UUID.randomUUID();
        }
    }

    public UUID getCargoId() {
        return cargoId;
    }

    public void setCargoId(UUID cargoId) {
        this.cargoId = cargoId;
    }

    public TarifaCurso getTarifa() {
        return tarifa;
    }

    public void setTarifa(TarifaCurso tarifa) {
        this.tarifa = tarifa;
    }

    public Mes getPeriodoMes() {
        return periodoMes;
    }

    public void setPeriodoMes(Mes periodoMes) {
        this.periodoMes = periodoMes;
    }

    public String getConcepto() {
        return concepto;
    }

    public void setConcepto(String concepto) {
        this.concepto = concepto;
    }

    public BigDecimal getMonto() {
        return monto;
    }

    public void setMonto(BigDecimal monto) {
        this.monto = monto;
    }

    public CargoEstado getEstado() {
        return estado;
    }

    public void setEstado(CargoEstado estado) {
        this.estado = estado;
    }
}

