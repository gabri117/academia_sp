package com.academia.academia.service.impl;

import com.academia.academia.dto.pagos.EstadoCuentaPeriodoDTO;
import com.academia.academia.dto.pagos.EstadoCuentaResponseDTO;
import com.academia.academia.dto.pagos.ReciboConOfertasDTO;
import com.academia.academia.entity.Cargo;
import com.academia.academia.entity.DetalleRecibo;
import com.academia.academia.entity.Inscripcion;
import com.academia.academia.entity.OfertaCurso;
import com.academia.academia.entity.Recibo;
import com.academia.academia.entity.TarifaCurso;
import com.academia.academia.entity.enums.Mes;
import com.academia.academia.repository.CargoRepository;
import com.academia.academia.repository.DetalleReciboRepository;
import com.academia.academia.repository.InscripcionRepository;
import com.academia.academia.repository.ReciboRepository;
import com.academia.academia.repository.TarifaCursoRepository;
import com.academia.academia.service.EstadoCuentaService;
import com.academia.academia.mapper.pagos.ReciboConOfertasMapper;
import java.math.BigDecimal;
import java.util.Arrays;
import java.util.EnumMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;

@Service
public class EstadoCuentaServiceImpl implements EstadoCuentaService {

    private static final BigDecimal ZERO = BigDecimal.ZERO;

    private final InscripcionRepository inscripcionRepository;
    private final TarifaCursoRepository tarifaCursoRepository;
    private final CargoRepository cargoRepository;
    private final ReciboRepository reciboRepository;
    private final DetalleReciboRepository detalleReciboRepository;
    private final ReciboConOfertasMapper reciboConOfertasMapper;

    public EstadoCuentaServiceImpl(
            InscripcionRepository inscripcionRepository,
            TarifaCursoRepository tarifaCursoRepository,
            CargoRepository cargoRepository,
            ReciboRepository reciboRepository,
            DetalleReciboRepository detalleReciboRepository,
            ReciboConOfertasMapper reciboConOfertasMapper) {
        this.inscripcionRepository = inscripcionRepository;
        this.tarifaCursoRepository = tarifaCursoRepository;
        this.cargoRepository = cargoRepository;
        this.reciboRepository = reciboRepository;
        this.detalleReciboRepository = detalleReciboRepository;
        this.reciboConOfertasMapper = reciboConOfertasMapper;
    }

    @Override
    public EstadoCuentaResponseDTO consolidarPorAlumno(UUID alumnoId) {
        Map<Mes, BigDecimal> cargosPorMes = new EnumMap<>(Mes.class);
        Map<Mes, BigDecimal> pagosPorMes = new EnumMap<>(Mes.class);

        List<Inscripcion> inscripciones = inscripcionRepository.findByAlumno_AlumnoId(alumnoId);
        Set<UUID> tarifasRelacionadas = new HashSet<>();
        for (Inscripcion inscripcion : inscripciones) {
            OfertaCurso oferta = inscripcion.getOferta();
            if (oferta == null) {
                continue;
            }
            List<TarifaCurso> tarifas = tarifaCursoRepository.findByOferta_OfertaId(oferta.getOfertaId());
            for (TarifaCurso tarifa : tarifas) {
                tarifasRelacionadas.add(tarifa.getTarifaId());
            }
        }

        for (UUID tarifaId : tarifasRelacionadas) {
            List<Cargo> cargos = cargoRepository.findByTarifa_TarifaId(tarifaId);
            for (Cargo cargo : cargos) {
                Mes periodo = cargo.getPeriodoMes();
                BigDecimal monto = cargo.getMonto();
                if (periodo != null && monto != null) {
                    cargosPorMes.merge(periodo, monto, BigDecimal::add);
                }
            }
        }

        List<Recibo> recibos = reciboRepository.findByAlumno_AlumnoId(alumnoId);
        for (Recibo recibo : recibos) {
            List<DetalleRecibo> detalles = detalleReciboRepository.findByRecibo_ReciboId(recibo.getReciboId());
            for (DetalleRecibo detalle : detalles) {
                Cargo cargo = detalle.getCargo();
                Mes periodo = cargo != null ? cargo.getPeriodoMes() : null;
                BigDecimal monto = detalle.getMontoAplicado();
                if (periodo != null && monto != null) {
                    pagosPorMes.merge(periodo, monto, BigDecimal::add);
                }
            }
        }

        List<EstadoCuentaPeriodoDTO> periodos = Arrays.stream(Mes.values())
                .filter(periodo -> cargosPorMes.containsKey(periodo) || pagosPorMes.containsKey(periodo))
                .map(periodo -> {
                    BigDecimal cargos = cargosPorMes.getOrDefault(periodo, ZERO);
                    BigDecimal pagos = pagosPorMes.getOrDefault(periodo, ZERO);
                    BigDecimal saldo = cargos.subtract(pagos);

                    EstadoCuentaPeriodoDTO detalle = new EstadoCuentaPeriodoDTO();
                    detalle.setPeriodo(periodo);
                    detalle.setTotalCargos(cargos);
                    detalle.setTotalPagos(pagos);
                    detalle.setSaldo(saldo);
                    return detalle;
                })
                .collect(Collectors.toList());

        BigDecimal saldoTotal = periodos
                .stream()
                .map(EstadoCuentaPeriodoDTO::getSaldo)
                .reduce(ZERO, BigDecimal::add);

        List<ReciboConOfertasDTO> reciboConOfertas =
                reciboConOfertasMapper.fromFlatRows(reciboRepository.findRecibosConOfertas(alumnoId, null, null, null));

        EstadoCuentaResponseDTO response = new EstadoCuentaResponseDTO();
        response.setAlumnoId(alumnoId);
        response.setPeriodos(periodos);
        response.setRecibos(reciboConOfertas);
        response.setSaldoTotal(saldoTotal);
        return response;
    }
}
