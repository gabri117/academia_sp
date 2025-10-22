package com.academia.academia.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.academia.academia.dto.pagos.DetalleReciboCreateDTO;
import com.academia.academia.dto.pagos.DetalleReciboResponseDTO;
import com.academia.academia.dto.pagos.ReciboConOfertasDTO;
import com.academia.academia.dto.pagos.ReciboOfertaFlat;
import com.academia.academia.entity.Cargo;
import com.academia.academia.entity.DetalleRecibo;
import com.academia.academia.entity.Recibo;
import com.academia.academia.entity.enums.ReciboEstado;
import com.academia.academia.entity.id.DetalleReciboId;
import com.academia.academia.mapper.pagos.DetalleReciboMapper;
import com.academia.academia.mapper.pagos.ReciboConOfertasMapper;
import com.academia.academia.mapper.pagos.ReciboMapper;
import com.academia.academia.repository.AlumnoRepository;
import com.academia.academia.repository.CargoRepository;
import com.academia.academia.repository.DetalleReciboRepository;
import com.academia.academia.repository.ReciboRepository;
import com.academia.academia.service.impl.ReciboServiceImpl;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ReciboServiceImplTest {

    @Mock
    private ReciboRepository reciboRepository;

    @Mock
    private AlumnoRepository alumnoRepository;

    @Mock
    private CargoRepository cargoRepository;

    @Mock
    private DetalleReciboRepository detalleReciboRepository;

    @Mock
    private CargoService cargoService;

    private ReciboServiceImpl reciboService;

    @BeforeEach
    void setUp() {
        reciboService = new ReciboServiceImpl(
                reciboRepository,
                alumnoRepository,
                cargoRepository,
                detalleReciboRepository,
                new ReciboMapper(),
                new DetalleReciboMapper(),
                new ReciboConOfertasMapper(),
                cargoService);
    }

    @Test
    void buscarRecibosConOfertasAgrupaResultadosPorRecibo() {
        UUID reciboId = UUID.randomUUID();
        UUID alumnoId = UUID.randomUUID();
        UUID ofertaUno = UUID.randomUUID();
        UUID ofertaDos = UUID.randomUUID();
        UUID institutoId = UUID.randomUUID();

        ReciboOfertaFlat filaUno = new ReciboOfertaFlat(
                reciboId,
                alumnoId,
                "REC-001",
                LocalDate.of(2025, 1, 15),
                ReciboEstado.EMITIDO,
                new BigDecimal("150.00"),
                ofertaUno,
                "Matematica Basica",
                "Lunes",
                LocalTime.of(8, 0),
                LocalTime.of(9, 30),
                institutoId,
                "Instituto Central");

        ReciboOfertaFlat filaDos = new ReciboOfertaFlat(
                reciboId,
                alumnoId,
                "REC-001",
                LocalDate.of(2025, 1, 15),
                ReciboEstado.EMITIDO,
                new BigDecimal("150.00"),
                ofertaDos,
                "Ciencias Naturales",
                "Miercoles",
                LocalTime.of(10, 0),
                LocalTime.of(11, 30),
                institutoId,
                "Instituto Central");

        UUID segundoReciboId = UUID.randomUUID();

        ReciboOfertaFlat filaSinOfertas = new ReciboOfertaFlat(
                segundoReciboId,
                UUID.randomUUID(),
                "REC-002",
                LocalDate.of(2025, 1, 20),
                ReciboEstado.ANULADO,
                new BigDecimal("0.00"),
                null,
                null,
                null,
                null,
                null,
                null,
                null);

        when(reciboRepository.findRecibosConOfertas(null, null, null, null))
                .thenReturn(List.of(filaUno, filaDos, filaSinOfertas));

        List<ReciboConOfertasDTO> resultado =
                reciboService.buscarRecibosConOfertas(null, null, null, null);

        assertEquals(2, resultado.size(), "Debe devolver un elemento por recibo distinto");

        ReciboConOfertasDTO primero = resultado.get(0);
        assertEquals(reciboId, primero.getReciboId());
        assertEquals(2, primero.getOfertas().size(), "Debe agrupar todas las ofertas del mismo recibo");
        assertEquals("Matematica Basica", primero.getOfertas().get(0).getNombreOferta());
        assertEquals("Ciencias Naturales", primero.getOfertas().get(1).getNombreOferta());
        assertEquals(ReciboEstado.EMITIDO, primero.getEstado(), "El estado debe viajar en el DTO");

        ReciboConOfertasDTO segundo = resultado.get(1);
        assertEquals(segundoReciboId, segundo.getReciboId());
        assertTrue(segundo.getOfertas().isEmpty(), "Debe regresar lista vacia cuando no existen ofertas");
        assertEquals(ReciboEstado.ANULADO, segundo.getEstado(), "Debe mapear el estado proporcionado");
    }

    @Test
    void buscarRecibosConOfertasDevuelveListaVaciaCuandoNoHayDatos() {
        when(reciboRepository.findRecibosConOfertas(null, null, null, null)).thenReturn(List.of());

        List<ReciboConOfertasDTO> resultado =
                reciboService.buscarRecibosConOfertas(null, null, null, null);

        assertTrue(resultado.isEmpty(), "La lista debe estar vacia si no hay registros");
        verifyNoInteractions(alumnoRepository, cargoRepository, detalleReciboRepository, cargoService);
    }

    @Test
    void registrarDetallePermiteReutilizarCargoSinValidarSaldo() {
        UUID reciboId = UUID.randomUUID();
        UUID cargoId = UUID.randomUUID();
        BigDecimal montoAplicado = new BigDecimal("250.00");

        Recibo recibo = new Recibo();
        recibo.setReciboId(reciboId);
        recibo.setTotal(BigDecimal.ZERO);

        Cargo cargo = new Cargo();
        cargo.setCargoId(cargoId);
        cargo.setMonto(new BigDecimal("100.00"));

        when(reciboRepository.findById(reciboId)).thenReturn(Optional.of(recibo));
        when(cargoRepository.findById(cargoId)).thenReturn(Optional.of(cargo));
        when(detalleReciboRepository.existsById(new DetalleReciboId(reciboId, cargoId))).thenReturn(false);

        DetalleRecibo guardado = new DetalleRecibo();
        guardado.setRecibo(recibo);
        guardado.setCargo(cargo);
        guardado.setMontoAplicado(montoAplicado);
        when(detalleReciboRepository.save(any(DetalleRecibo.class))).thenReturn(guardado);
        when(reciboRepository.save(recibo)).thenReturn(recibo);
        when(cargoService.recalcularEstado(cargoId)).thenReturn(null);

        DetalleReciboCreateDTO dto = new DetalleReciboCreateDTO();
        dto.setReciboId(reciboId);
        dto.setCargoId(cargoId);
        dto.setMontoAplicado(montoAplicado);

        DetalleReciboResponseDTO response = reciboService.registrarDetalle(dto);

        assertEquals(montoAplicado, response.getMontoAplicado(), "Debe registrar el monto solicitado");
        assertEquals(montoAplicado, recibo.getTotal(), "El total del recibo debe acumular el monto aplicado");
    }
}
