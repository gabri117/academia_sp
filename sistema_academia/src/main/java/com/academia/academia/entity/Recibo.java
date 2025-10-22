package com.academia.academia.entity;

import com.academia.academia.entity.enums.ReciboEstado;
import com.academia.academia.entity.type.PostgreSQLEnumType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;
import org.hibernate.annotations.Type;

@Entity
@Table(name = "recibo")
public class Recibo {

    @Id
    @Column(name = "recibo_id", nullable = false)
    private UUID reciboId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alumno_id", nullable = false)
    private Alumno alumno;

    @Column(name = "correlativo_recibo", unique = true, length = 20)
    private String correlativoRecibo;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false, columnDefinition = "recibo_estado_enum")
    @Type(PostgreSQLEnumType.class)
    private ReciboEstado estado;

    @PrePersist
    public void prePersist() {
        if (reciboId == null) {
            reciboId = UUID.randomUUID();
        }
        if (fecha == null) {
            fecha = LocalDate.now();
        }
        if (total == null) {
            total = BigDecimal.ZERO;
        }
        if (estado == null) {
            estado = ReciboEstado.EMITIDO;
        }
    }

    public UUID getReciboId() {
        return reciboId;
    }

    public void setReciboId(UUID reciboId) {
        this.reciboId = reciboId;
    }

    public Alumno getAlumno() {
        return alumno;
    }

    public void setAlumno(Alumno alumno) {
        this.alumno = alumno;
    }

    public String getCorrelativoRecibo() {
        return correlativoRecibo;
    }

    public void setCorrelativoRecibo(String correlativoRecibo) {
        this.correlativoRecibo = correlativoRecibo;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public ReciboEstado getEstado() {
        return estado;
    }

    public void setEstado(ReciboEstado estado) {
        this.estado = estado;
    }
}

