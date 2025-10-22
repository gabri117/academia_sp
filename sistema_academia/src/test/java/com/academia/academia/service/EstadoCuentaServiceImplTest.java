package com.academia.academia.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import static org.mockito.Mockito.when;

import com.academia.academia.dto.pagos.ReciboConOfertasDTO;
import com.academia.academia.dto.pagos.ReciboOfertaFlat;
import com.academia.academia.entity.Cargo;
import com.academia.academia.entity.DetalleRecibo;
import com.academia.academia.entity.Recibo;
import com.academia.academia.entity.enums.Mes;
import com.academia.academia.entity.enums.ReciboEstado;
import com.academia.academia.mapper.pagos.ReciboConOfertasMapper;
import com.academia.academia.repository.CargoRepository;
import com.academia.academia.repository.DetalleReciboRepository;
import com.academia.academia.repository.InscripcionRepository;
import com.academia.academia.repository.ReciboRepository;
import com.academia.academia.repository.TarifaCursoRepository;
import com.academia.academia.service.impl.EstadoCuentaServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EstadoCuentaServiceImplTest {

    @Mock
    private InscripcionRepository inscripcionRepository;

    @Mock
    private TarifaCursoRepository tarifaCursoRepository;

    @Mock
    private CargoRepository cargoRepository;

    @Mock
    private ReciboRepository reciboRepository;

    @Mock
    private DetalleReciboRepository detalleReciboRepository;

    private EstadoCuentaServiceImpl estadoCuentaService;

    @BeforeEach
    void setUp() {
        estadoCuentaService = new EstadoCuentaServiceImpl(
                inscripcionRepository,
                tarifaCursoRepository,
                cargoRepository,
                reciboRepository,
                detalleReciboRepository,
                new ReciboConOfertasMapper());
    }

    @Test
    void consolidarIncluyeListadoCompletoDeRecibos() {
        UUID alumnoId = UUID.randomUUID();
        UUID reciboId = UUID.randomUUID();
        UUID cargoId = UUID.randomUUID();
        UUID ofertaId = UUID.randomUUID();

        Recibo recibo = new Recibo();
        recibo.setReciboId(reciboId);
        recibo.setTotal(BigDecimal.ZERO);

        when(inscripcionRepository.findByAlumno_AlumnoId(alumnoId)).thenReturn(List.of());
        when(reciboRepository.findByAlumno_AlumnoId(alumnoId)).thenReturn(List.of(recibo));

        Cargo cargo = new Cargo();
        cargo.setPeriodoMes(Mes.ENERO);

        DetalleRecibo detalle = new DetalleRecibo();
        detalle.setRecibo(recibo);
        detalle.setCargo(cargo);
        detalle.setMontoAplicado(new BigDecimal("75.50"));
        when(detalleReciboRepository.findByRecibo_ReciboId(reciboId)).thenReturn(List.of(detalle));

        ReciboOfertaFlat flat = new ReciboOfertaFlat(
                reciboId,
                alumnoId,
                "REC-001",
                LocalDate.of(2025, 1, 10),
                ReciboEstado.EMITIDO,
                new BigDecimal("75.50"),
                ofertaId,
                "Oferta Especial",
                "Martes",
                LocalTime.of(9, 0),
                LocalTime.of(10, 30),
                UUID.randomUUID(),
                "Instituto Central");
        when(reciboRepository.findRecibosConOfertas(alumnoId, null, null, null)).thenReturn(List.of(flat));

        var response = estadoCuentaService.consolidarPorAlumno(alumnoId);

        assertEquals(alumnoId, response.getAlumnoId());
        assertNotNull(response.getRecibos(), "Debe devolver el listado de recibos");
        assertEquals(1, response.getRecibos().size(), "Debe listar todos los recibos emitidos");
        ReciboConOfertasDTO dto = response.getRecibos().get(0);
        assertEquals(reciboId, dto.getReciboId());
        assertEquals(1, dto.getOfertas().size(), "Debe incluir la oferta asociada al recibo");
        assertEquals("Oferta Especial", dto.getOfertas().get(0).getNombreOferta());
    }
}
