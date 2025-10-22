import { useCallback, useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Plus, RotateCw, X, Pencil, Trash2, Save, Printer, FileText } from 'lucide-react';

import Page from '../../components/layout/Page';
import Input from '../../components/form/Input';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';
import Table, { type TableColumn } from '../../components/ui/Table';
import { useToast } from '../../components/ui/Toast';
import PanelCard from '@/components/kit/PanelCard';
import HeroSummary from '@/components/kit/HeroSummary';
import { cls } from '@/components/ui/stylekit';
import { isApiError } from '../../api/types';

import { useOfertaOptions, useAlumnoOptions } from '../../hooks/useCatalogOptions';
import type { OfertaSelectOption, SelectOption } from '../../hooks/useCatalogOptions';
import type { Cargo, CargoEstado, Mes, Recibo, TarifaCurso } from '../../contract/moduleC';
import { MES as MES_ENUM, CARGO_ESTADO as CARGO_ESTADO_ENUM } from '../../contract/moduleC';
import type { UUID } from '../../contract/moduleA';

import { listarCargosPorTarifa, crearCargo, actualizarCargo, obtenerCargo } from '../../services/cargos';
import { listarTarifasPorOferta } from '../../services/tarifas';
import { getOfertaCurso } from '../../services/ofertas';
import { listEstablecimientos } from '../../services/establecimientos';
import { registrarRecibo, obtenerRecibo } from '../../services/recibos';
import { registrarDetalleRecibo, listarDetalleReciboPorRecibo } from '../../services/detalleRecibo';
import { listarInscripcionesPorAlumno, listarInscripcionesPorOferta } from '../../services/inscripciones';
import { getAlumno } from '../../services/alumnos';
import { listEncargadosPorAlumno } from '../../services/alumnoEncargado';

import { generarReciboPdf } from '../../utils/recibosPdf';

import ScrollX from '@/components/ui/ScrollX';
import NiceSelect from '@/components/ui/NiceSelect';

const toOptions = (arr: readonly string[]) =>
  arr.map((value) => ({ label: value, value }));

type TarifaDetalle = TarifaCurso & {
  ofertaNombre: string;
  ofertaHorario: string | null;
  institutoNombre: string | null;
  descripcion: string;
};

type CargoRow = Cargo & {
  ofertaId?: string | null;
  ofertaNombre?: string | null;
  ofertaHorario?: string | null;
  institutoNombre?: string | null;
  tarifaDescripcion?: string | null;
};

type NuevoCargoForm = {
  tarifaId: string;
  periodoMes: Mes;
  concepto: string;
  monto: number;
};

type ConceptoPreset = 'Mensualidad' | 'Inscripcion' | 'Otros';

type ReciboPdfData = Parameters<typeof generarReciboPdf>[0];

type BuildReciboPdfParams = {
  recibo: Recibo;
  cargo: CargoRow;
  alumnoId: string;
  montoAplicado: number;
  numeroPagos: number;
  fechaSeleccionada?: string;
};

const CONCEPTO_PRESET_OPTIONS: Array<{ label: string; value: ConceptoPreset }> = [
  { label: 'Mensualidad', value: 'Mensualidad' },
  { label: 'Inscripcion', value: 'Inscripcion' },
  { label: 'Otros', value: 'Otros' },
];

const normalizeConcepto = (value: string | null | undefined) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .toLowerCase();

const inferPresetFromConcepto = (concepto: string | null | undefined): ConceptoPreset => {
  const normalized = normalizeConcepto(concepto);
  if (normalized === 'mensualidad') return 'Mensualidad';
  if (normalized === 'inscripcion') return 'Inscripcion';
  return 'Otros';
};

type GenerarReciboForm = {
  alumnoId: string;
  montoUnitario: number;
  montoAplicado: number;
  numeroPagos: number;
  fecha: string;
};

const formatCurrency = (value: number) =>
  `Q ${value.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const describeTarifa = (tarifa: TarifaCurso) => {
  const parts: string[] = [];
  if (typeof tarifa.montoInscripcion === 'number') {
    parts.push(`Inscripcion: ${formatCurrency(tarifa.montoInscripcion)}`);
  }
  if (typeof tarifa.montoMensualidad === 'number') {
    parts.push(`Mensualidad: ${formatCurrency(tarifa.montoMensualidad)}`);
  }
  return parts.length > 0 ? parts.join(' / ') : 'Montos no definidos';
};

const fallbackInstitutoNombre = (id: string | null | undefined) =>
  id ? `Instituto ${String(id).slice(0, 8).toUpperCase()}` : 'Instituto no asignado';

const roundAmount = (value: number) => Number(Number.isFinite(value) ? value.toFixed(2) : '0');

const buildReciboPdfData = async ({
  recibo,
  cargo,
  alumnoId,
  montoAplicado,
  numeroPagos,
  fechaSeleccionada,
}: BuildReciboPdfParams): Promise<ReciboPdfData> => {
  const reciboUuid = recibo.reciboId as UUID;
  const alumnoUuid = alumnoId as UUID;

  const [detallesResponse, alumnoInfo, encargadosResponse] = await Promise.all([
    listarDetalleReciboPorRecibo(reciboUuid).catch(() => []),
    getAlumno(alumnoUuid).catch(() => null),
    listEncargadosPorAlumno(alumnoUuid).catch(() => []),
  ]);

  const detallesData = await Promise.all(
    (Array.isArray(detallesResponse) ? detallesResponse : []).map(async (detalle) => {
      try {
        const cargoDetalle = await obtenerCargo(detalle.cargoId as UUID);
        const montoOriginal =
          typeof cargoDetalle?.monto === 'number'
            ? Number(cargoDetalle.monto)
            : cargo.monto ?? null;

        return {
          cargoId: String(detalle.cargoId),
          periodoMes: cargoDetalle?.periodoMes ?? cargo.periodoMes ?? null,
          concepto: cargoDetalle?.concepto ?? cargo.concepto ?? null,
          montoOriginal,
          montoAplicado:
            typeof detalle.montoAplicado === 'number' ? detalle.montoAplicado : montoAplicado,
        };
      } catch {
        return {
          cargoId: String(detalle.cargoId),
          periodoMes: cargo.periodoMes ?? null,
          concepto: cargo.concepto ?? null,
          montoOriginal: cargo.monto ?? null,
          montoAplicado:
            typeof detalle.montoAplicado === 'number' ? detalle.montoAplicado : montoAplicado,
        };
      }
    }),
  );

  const detalles =
    detallesData.length > 0
      ? detallesData
      : [
          {
            cargoId: String(cargo.cargoId),
            periodoMes: cargo.periodoMes ?? null,
            concepto: cargo.concepto ?? null,
            montoOriginal: cargo.monto ?? null,
            montoAplicado,
          },
        ];

  const alumnoNombrePartes =
    alumnoInfo
      ? [alumnoInfo.nombre, alumnoInfo.apellido]
          .map((part) => part?.trim())
          .filter((part): part is string => Boolean(part && part.length > 0))
      : [];

  const alumnoNombre =
    alumnoNombrePartes.length > 0
      ? alumnoNombrePartes.join(' ')
      : `Alumno ${String(alumnoId).slice(0, 8).toUpperCase()}`;

  const encargados =
    Array.isArray(encargadosResponse) && encargadosResponse.length > 0
      ? encargadosResponse
          .map((item: { encargadoNombreCompleto?: string | null }) =>
            item.encargadoNombreCompleto?.trim(),
          )
          .filter((nombre): nombre is string => Boolean(nombre && nombre.length > 0))
      : [];

  const montoBase =
    detalles.find((detalle) => typeof detalle.montoOriginal === 'number')?.montoOriginal ??
    cargo.monto ??
    null;

  const ofertas =
    cargo.ofertaId != null
      ? [
          {
            ofertaId: String(cargo.ofertaId),
            nombre: cargo.ofertaNombre ?? 'Oferta sin nombre',
            instituto: cargo.institutoNombre ?? null,
            grado: null,
            dia: null,
            horaInicio: null,
            horaFinalizacion: null,
          },
        ]
      : [];

  return {
    correlativo: recibo.correlativoRecibo ?? null,
    alumnoNombre,
    encargados,
    fechaEmision: recibo.fecha ?? fechaSeleccionada ?? null,
    estado: recibo.estado ?? 'EMITIDO',
    total: typeof recibo.total === 'number' ? recibo.total : montoAplicado,
    montoBase: typeof montoBase === 'number' ? montoBase : null,
    numeroPagos,
    ofertas,
    detalles,
  };
};

const CargosList = () => {
  const { notify } = useToast();

  const [ofertaId, setOfertaId] = useState<string>('');
  const [periodoMes, setPeriodoMes] = useState<string>('');
  const [estado, setEstado] = useState<string>('');
  const [estadoEdicion, setEstadoEdicion] = useState<CargoEstado>('PENDIENTE');

  const { data: ofertaOptionsBase = [], isLoading: loadingOfertas } = useOfertaOptions();
  const ofertaOptions = useMemo(
    () => [{ label: 'Todas las ofertas', value: '' }, ...ofertaOptionsBase],
    [ofertaOptionsBase],
  );
  const ofertaIndex = useMemo(() => {
    const map = new Map<string, OfertaSelectOption>();
    ofertaOptionsBase.forEach((oferta) => map.set(oferta.value, oferta));
    return map;
  }, [ofertaOptionsBase]);

  const { data: alumnoOptions = [], isLoading: loadingAlumnoOptions } = useAlumnoOptions();

  const [institutoNombreMap, setInstitutoNombreMap] = useState<Record<string, string>>({});
  const [tarifasDisponibles, setTarifasDisponibles] = useState<TarifaDetalle[]>([]);
  const [loadingTarifas, setLoadingTarifas] = useState(false);

  const [cargando, setCargando] = useState(false);
  const [cargos, setCargos] = useState<CargoRow[]>([]);

  const [showNuevoCargo, setShowNuevoCargo] = useState(false);
  const [showGenerarRecibo, setShowGenerarRecibo] = useState(false);
  const [cargoSeleccionado, setCargoSeleccionado] = useState<CargoRow | null>(null);

  const [nuevoCargo, setNuevoCargo] = useState<NuevoCargoForm>({
    tarifaId: '',
    periodoMes: MES_ENUM[0],
    concepto: 'Mensualidad',
    monto: 0,
  });
  const [conceptoPreset, setConceptoPreset] = useState<ConceptoPreset>('Mensualidad');
  const [genRecibo, setGenRecibo] = useState<GenerarReciboForm>({
    alumnoId: '',
    montoUnitario: 0,
    montoAplicado: 0,
    numeroPagos: 1,
    fecha: format(new Date(), 'yyyy-MM-dd'),
  });

  const [alumnosDeOferta, setAlumnosDeOferta] = useState<SelectOption[]>([]);
  const [loadingAlumnosOferta, setLoadingAlumnosOferta] = useState(false);
  const [alumnoFiltro, setAlumnoFiltro] = useState('');

  useEffect(() => {
    let active = true;
    const cargarInstitutos = async () => {
      try {
        const establecimientos = await listEstablecimientos({ page: 0, size: 200, sort: 'nombre,asc' });
        if (!active) return;
        const map: Record<string, string> = {};
        establecimientos.content?.forEach((inst) => {
          if (inst?.institutoId) {
            map[String(inst.institutoId)] = inst.nombre ?? fallbackInstitutoNombre(inst.institutoId);
          }
        });
        setInstitutoNombreMap(map);
      } catch {
        if (active) {
          notify({
            title: 'Institutos',
            description: 'No se pudieron cargar los nombres de institutos.',
            variant: 'warning',
          });
        }
      }
    };
    void cargarInstitutos();
    return () => {
      active = false;
    };
  }, [notify]);

  useEffect(() => {
    if (loadingOfertas) return;

    let active = true;
    const cargarTarifas = async () => {
      setLoadingTarifas(true);
      try {
        const resultados = await Promise.all(
          ofertaOptionsBase
            .filter((opt) => Boolean(opt.value))
            .map(async (opt) => {
              const [tarifas, ofertaCompleta] = await Promise.all([
                listarTarifasPorOferta(opt.value),
                getOfertaCurso(opt.value).catch(() => null),
              ]);
              const oferta = ofertaIndex.get(opt.value);

              const ofertaNombre =
                oferta?.cursoNombre ??
                (opt.label ? opt.label.split(' - ')[0] : `Oferta ${opt.value.slice(0, 8).toUpperCase()}`);

              const horarioDesdeOpciones =
                oferta?.dia && oferta?.horaInicio && oferta?.horaFin
                  ? `${oferta.dia} ${oferta.horaInicio} - ${oferta.horaFin}`
                  : null;
              const horarioDesdeApi =
                ofertaCompleta?.dia && ofertaCompleta?.horaInicio && ofertaCompleta?.horaFinalizacion
                  ? `${ofertaCompleta.dia} ${ofertaCompleta.horaInicio} - ${ofertaCompleta.horaFinalizacion}`
                  : null;
              const ofertaHorario = horarioDesdeOpciones ?? horarioDesdeApi;

              const institutoId = ofertaCompleta?.institutoId ?? null;
              const institutoNombre = institutoId
                ? institutoNombreMap[institutoId] ?? fallbackInstitutoNombre(institutoId)
                : null;

              return tarifas.map<TarifaDetalle>((tarifa) => ({
                ...tarifa,
                ofertaNombre,
                ofertaHorario,
                institutoNombre,
                descripcion: describeTarifa(tarifa),
              }));
            }),
        );

        if (!active) return;

        const unique = new Map<string, TarifaDetalle>();
        resultados.flat().forEach((tarifa) => {
          if (!unique.has(tarifa.tarifaId)) {
            unique.set(tarifa.tarifaId, tarifa);
          }
        });
        setTarifasDisponibles(Array.from(unique.values()));
      } catch {
        if (active) {
          setTarifasDisponibles([]);
          notify({
            title: 'Tarifas',
            description: 'No se pudieron cargar las tarifas disponibles.',
            variant: 'error',
          });
        }
      } finally {
        if (active) {
          setLoadingTarifas(false);
        }
      }
    };

    void cargarTarifas();

    return () => {
      active = false;
    };
  }, [loadingOfertas, ofertaOptionsBase, ofertaIndex, institutoNombreMap, notify]);

  const tarifaDetalleMap = useMemo(() => {
    const map = new Map<string, TarifaDetalle>();
    tarifasDisponibles.forEach((tarifa) => map.set(tarifa.tarifaId, tarifa));
    return map;
  }, [tarifasDisponibles]);

  const tarifaSeleccionada = useMemo(
    () => (nuevoCargo.tarifaId ? tarifaDetalleMap.get(nuevoCargo.tarifaId) ?? null : null),
    [nuevoCargo.tarifaId, tarifaDetalleMap],
  );

  const buscarCargos = useCallback(async () => {
    if (loadingTarifas) return;

    const tarifasObjetivo = tarifasDisponibles.filter((tarifa) => !ofertaId || tarifa.ofertaId === ofertaId);

    if (tarifasObjetivo.length === 0) {
      setCargos([]);
      return;
    }

    setCargando(true);
    try {
      const tarifaMap = new Map<string, TarifaDetalle>();
      tarifasObjetivo.forEach((tarifa) => tarifaMap.set(tarifa.tarifaId, tarifa));

      const cargosPorTarifa = await Promise.all(
        tarifasObjetivo.map((tarifa) => listarCargosPorTarifa(tarifa.tarifaId)),
      );

      let combinados = cargosPorTarifa.flat().map<CargoRow>((cargo) => {
        const detalle = tarifaMap.get(cargo.tarifaId);
        return {
          ...cargo,
          ofertaId: detalle?.ofertaId ?? null,
          ofertaNombre: detalle?.ofertaNombre ?? null,
          ofertaHorario: detalle?.ofertaHorario ?? null,
          institutoNombre: detalle?.institutoNombre ?? null,
          tarifaDescripcion: detalle?.descripcion ?? '--',
        };
      });

      if (periodoMes) {
        combinados = combinados.filter((cargo) => cargo.periodoMes === periodoMes);
      }

      if (estado) {
        combinados = combinados.filter((cargo) => cargo.estado === estado);
      }

      combinados.sort((a, b) => a.periodoMes.localeCompare(b.periodoMes));
      setCargos(combinados);
    } catch {
      notify({ title: 'Error', description: 'No fue posible obtener los cargos.', variant: 'error' });
    } finally {
      setCargando(false);
    }
  }, [loadingTarifas, tarifasDisponibles, ofertaId, periodoMes, estado, notify]);

  useEffect(() => {
    if (loadingOfertas || loadingTarifas) return;
    void buscarCargos();
  }, [buscarCargos, loadingOfertas, loadingTarifas]);

  const resetAlumnoSelection = useCallback(() => {
    setGenRecibo((prev) => ({
      ...prev,
      alumnoId: '',
      numeroPagos: 1,
      montoAplicado: roundAmount(prev.montoUnitario),
    }));
    setAlumnoFiltro('');
  }, []);

  const alumnosFiltrados = useMemo(() => {
    const term = alumnoFiltro.trim().toLowerCase();
    if (!term) return alumnosDeOferta;
    return alumnosDeOferta.filter((opt) =>
      String(opt.label ?? opt.value).toLowerCase().includes(term),
    );
  }, [alumnoFiltro, alumnosDeOferta]);

  const alumnoPlaceholder = useMemo(() => {
    if (loadingAlumnosOferta) return 'Cargando alumnos...';
    if (alumnosFiltrados.length > 0) return 'Selecciona un alumno';
    return alumnoFiltro.trim() ? 'No hay coincidencias' : 'No hay alumnos inscritos para esta oferta';
  }, [alumnosFiltrados.length, alumnoFiltro, loadingAlumnosOferta]);

  const mapInscripcionesToAlumnoOptions = async (
    inscripciones: Array<{ 
      alumnoId: string
      alumnoNombreCompleto?: string | null
      alumnoNombre?: string | null
      alumnoApellido?: string | null
      alumnoCarnet?: string | null
    }>,
    allAlumnoOptions: SelectOption[],
  ): Promise<SelectOption[]> => {
    type CatalogInfo = { nombre: string; carnet: string }
    const catalogInfoMap = new Map<string, CatalogInfo>()

    allAlumnoOptions.forEach((opt) => {
      const id = String(opt.value)
      const rawLabel = opt.label ?? ''
      const [maybeName, carnetPart] = rawLabel.split(/-+\s*Carnet:\s*/i)
      const nombre = (maybeName ?? '').trim()
      const carnet = (carnetPart ?? '').trim()
      catalogInfoMap.set(id, {
        nombre,
        carnet,
      })
    })

    const sanitize = (value?: string | null) => {
      const normalized = (value ?? '').trim()
      return normalized.length > 0 ? normalized : ''
    }

    const candidates = inscripciones.reduce< 
      Array<{ 
        id: string
        nombre: string
        carnet: string
        needsNombre: boolean
        needsCarnet: boolean
      }>
    >((acc, inscripcion) => {
      const id = String(inscripcion.alumnoId)
      if (acc.some((item) => item.id === id)) return acc

      const catalogInfo = catalogInfoMap.get(id)
      const idLower = id.toLowerCase()

      const nombreCandidates = [
        sanitize(inscripcion.alumnoNombreCompleto),
        sanitize(
          [inscripcion.alumnoNombre, inscripcion.alumnoApellido].filter(Boolean).join(' '),
        ),
        sanitize(catalogInfo?.nombre),
      ].filter((value) => value.length > 0 && value.toLowerCase() !== idLower)

      const carnetCandidates = [
        sanitize(inscripcion.alumnoCarnet),
        sanitize(catalogInfo?.carnet),
      ].filter((value) => value.length > 0 && value.toLowerCase() !== idLower)

      const nombre = nombreCandidates[0] ?? `Alumno ${id.slice(0, 8).toUpperCase()}`
      const carnet = carnetCandidates[0] ?? 'Sin carnet'

      acc.push({
        id,
        nombre,
        carnet,
        needsNombre: nombreCandidates.length === 0,
        needsCarnet: carnetCandidates.length === 0,
      })

      return acc
    }, [])

    const idsToFetch = Array.from(
      new Set(
        candidates
          .filter((candidate) => candidate.needsNombre || candidate.needsCarnet)
          .map((candidate) => candidate.id),
      ),
    )

    if (idsToFetch.length > 0) {
      const fetched = await Promise.all(
        idsToFetch.map(async (alumnoId) => {
          try {
            const alumno = await getAlumno(alumnoId)
            return { alumnoId, alumno }
          } catch {
            return null
          }
        }),
      )

      const fetchedMap = new Map<string, { nombre: string; carnet: string }>()
      fetched.forEach((item) => {
        if (!item || !item.alumno) return
        const nombre = sanitize(
          [item.alumno.nombre, item.alumno.apellido].filter(Boolean).join(' '),
        )
        const carnet = sanitize(item.alumno.carnet)
        fetchedMap.set(item.alumnoId, { nombre, carnet })
      })

      candidates.forEach((candidate) => {
        const info = fetchedMap.get(candidate.id)
        if (!info) return
        if (candidate.needsNombre && info.nombre.length > 0) {
          candidate.nombre = info.nombre
        }
        if (candidate.needsCarnet && info.carnet.length > 0) {
          candidate.carnet = info.carnet
        }
      })
    }

    return candidates.map<SelectOption>((candidate) => ({
      value: candidate.id,
      label: `${candidate.nombre} - Carnet: ${candidate.carnet}`,
    }))
  }

  const onEditar = useCallback((cargo: CargoRow) => {
    const preset = inferPresetFromConcepto(cargo.concepto);
    setNuevoCargo({
      tarifaId: cargo.tarifaId,
      concepto: preset === 'Otros' ? cargo.concepto ?? '' : preset,
      periodoMes: cargo.periodoMes,
      monto: cargo.monto,
    });
    setConceptoPreset(preset);
    setEstadoEdicion(cargo.estado);
    setCargoSeleccionado(cargo);
    setShowNuevoCargo(true);
  }, []);

  const onAnular = useCallback(
    async (cargo: CargoRow) => {
      const confirmacion = window.confirm('Esta seguro de anular la plantilla de cargo?');
      if (!confirmacion) {
        return;
      }
      try {
        await actualizarCargo(cargo.cargoId, {
          periodoMes: cargo.periodoMes,
          concepto: cargo.concepto,
          monto: cargo.monto,
          estado: 'CANCELADO',
        });
        notify({ title: 'Cargo anulado', variant: 'success' });
        await buscarCargos();
      } catch {
        notify({ title: 'Error', description: 'No se pudo anular el cargo.', variant: 'error' });
      }
    },
    [buscarCargos, notify],
  );

  const onAbrirRecibo = useCallback(
    async (cargo: CargoRow) => {
      setCargoSeleccionado(cargo);
      resetAlumnoSelection();

      const tarifaDetalle = tarifaDetalleMap.get(cargo.tarifaId);
      const montoUnitario = cargo.monto ?? tarifaDetalle?.montoMensualidad ?? 0;
      const montoInicial = roundAmount(montoUnitario);

      setGenRecibo({
        alumnoId: '',
        montoUnitario: montoInicial,
        montoAplicado: montoInicial,
        numeroPagos: 1,
        fecha: format(new Date(), 'yyyy-MM-dd'),
      });

      setLoadingAlumnosOferta(true);
      try {
        const ofertaIdRelacionada = tarifaDetalle?.ofertaId ?? cargo.ofertaId ?? null;

        if (ofertaIdRelacionada) {
          const inscripciones = await listarInscripcionesPorOferta(ofertaIdRelacionada as string);
          const opciones = await mapInscripcionesToAlumnoOptions(
            Array.isArray(inscripciones) ? inscripciones : [],
            alumnoOptions,
          );
          setAlumnosDeOferta(opciones);
        } else {
          setAlumnosDeOferta([]);
        }
      } catch {
        setAlumnosDeOferta([]);
        notify({
          title: 'Alumnos de la oferta',
          description: 'No fue posible cargar los alumnos inscritos.',
          variant: 'warning',
        });
      } finally {
        setLoadingAlumnosOferta(false);
        setShowGenerarRecibo(true);
      }
    },
    [alumnoOptions, notify, resetAlumnoSelection, tarifaDetalleMap],
  );

  useEffect(() => {
    if (!showNuevoCargo) return;

    if (conceptoPreset === 'Otros') {
      setNuevoCargo((prev) => {
        if (inferPresetFromConcepto(prev.concepto) === 'Otros') {
          return prev;
        }
        return { ...prev, concepto: '' };
      });
      return;
    }

    setNuevoCargo((prev) => {
      if (prev.concepto === conceptoPreset) {
        return prev;
      }
      return { ...prev, concepto: conceptoPreset };
    });
  }, [conceptoPreset, showNuevoCargo]);

  useEffect(() => {
    if (!showNuevoCargo) return;
    if (conceptoPreset === 'Otros') return;

    const referencia =
      conceptoPreset === 'Mensualidad'
        ? tarifaSeleccionada?.montoMensualidad
        : tarifaSeleccionada?.montoInscripcion;

    const nextMonto = typeof referencia === 'number' ? referencia : 0;

    setNuevoCargo((prev) => {
      if (prev.monto === nextMonto) {
        return prev;
      }
      return { ...prev, monto: nextMonto };
    });
  }, [conceptoPreset, showNuevoCargo, tarifaSeleccionada]);

  const isMontoEditable = conceptoPreset === 'Otros' || !tarifaSeleccionada;
  const montoHint =
    conceptoPreset === 'Otros'
      ? undefined
      : tarifaSeleccionada
        ? 'El monto se llena automaticamente segun la tarifa seleccionada.'
        : 'Selecciona una tarifa para cargar el monto automaticamente.';

  const validarAlumnoPertenece = async (alumnoId: string, cargo: CargoRow) => {
    try {
      const tarifaDetalle = tarifaDetalleMap.get(cargo.tarifaId);
      const inscripciones = await listarInscripcionesPorAlumno(alumnoId);
      const ofertaRelacionada = tarifaDetalle?.ofertaId ?? cargo.ofertaId ?? null;
      if (!ofertaRelacionada || !Array.isArray(inscripciones)) return false;
      return inscripciones.some(
        (inscripcion: { ofertaId?: string | null }) =>
          String(inscripcion.ofertaId) === String(ofertaRelacionada),
      );
    } catch {
      return false;
    }
  };

  const generarRecibo = async () => {
    try {
      if (!cargoSeleccionado) return;
      const numeroPagos = Math.max(1, Math.floor(Number(genRecibo.numeroPagos) || 1));
      const montoUnitario = Number(genRecibo.montoUnitario);

      if (!genRecibo.alumnoId || Number.isNaN(montoUnitario) || montoUnitario <= 0) {
        notify({
          title: 'Datos incompletos',
          description: 'Selecciona un alumno y define el monto aplicado.',
          variant: 'warning',
        });
        return;
      }

      const montoAplicado = roundAmount(montoUnitario * numeroPagos);

      const pertenece = await validarAlumnoPertenece(genRecibo.alumnoId, cargoSeleccionado);
      if (!pertenece) {
        notify({
          title: 'Alumno no valido',
          description: 'El alumno no pertenece a la oferta vinculada al cargo.',
          variant: 'warning',
        });
        return;
      }

      const recibo = await registrarRecibo({
        alumnoId: genRecibo.alumnoId,
        fecha: genRecibo.fecha,
        estado: 'EMITIDO',
      });

      await registrarDetalleRecibo({
        reciboId: recibo.reciboId,
        cargoId: cargoSeleccionado.cargoId,
        montoAplicado,
      });

      await actualizarCargo(cargoSeleccionado.cargoId, {
        periodoMes: cargoSeleccionado.periodoMes,
        concepto: cargoSeleccionado.concepto,
        monto: cargoSeleccionado.monto,
        estado: 'PENDIENTE',
      });

      let pdfGenerado = false;
      try {
        const reciboActualizado = await obtenerRecibo(recibo.reciboId as UUID).catch(() => recibo);
        const detallePdf = await buildReciboPdfData({
          recibo: reciboActualizado,
          cargo: cargoSeleccionado,
          alumnoId: genRecibo.alumnoId,
          montoAplicado,
          numeroPagos,
          fechaSeleccionada: genRecibo.fecha,
        });
        await generarReciboPdf(detallePdf);
        pdfGenerado = true;
      } catch (pdfError) {
        console.error('Error al generar PDF del recibo recien creado', pdfError);
        notify({
          title: 'Recibo generado',
          description:
            'El recibo se creo correctamente, pero no fue posible generar el PDF automaticamente.',
          variant: 'warning',
        });
      }

      const tarifaDetalle = tarifaDetalleMap.get(cargoSeleccionado.tarifaId);
      const montoDefault = roundAmount(
        cargoSeleccionado.monto ?? tarifaDetalle?.montoMensualidad ?? 0,
      );

      setShowGenerarRecibo(false);
      setAlumnosDeOferta([]);
      setGenRecibo({
        alumnoId: '',
        montoUnitario: montoDefault,
        montoAplicado: montoDefault,
        numeroPagos: 1,
        fecha: format(new Date(), 'yyyy-MM-dd'),
      });
      setAlumnoFiltro('');
      await buscarCargos();

      if (pdfGenerado) {
        notify({
          title: 'Recibo generado',
          description: 'El recibo se creo y se descargo el PDF.',
          variant: 'success',
        });
      }
    } catch (error) {
      if (isApiError(error) && error.status === 409) {
        notify({
          title: 'Conflicto al generar recibo',
          description: error.message ?? 'Ya existe un recibo en conflicto o la operacion no es valida.',
          variant: 'warning',
        });
      } else {
        notify({ title: 'Error', description: 'No se pudo generar el recibo.', variant: 'error' });
      }
    }
  };

  const columns = useMemo<TableColumn<CargoRow>[]>(() => {
    const cols: TableColumn<CargoRow>[] = [
      {
        key: 'ofertaNombre',
        header: 'Oferta',
        render: (item) => (
          <div className="flex flex-col text-sm leading-5 text-gray-800">
            <span className="font-semibold">
              {item.institutoNombre ?? fallbackInstitutoNombre(item.ofertaId)}
            </span>
            <span className="text-sm text-gray-700">
              {item.ofertaNombre ?? 'Oferta no disponible'}
            </span>
            {item.ofertaHorario && (
              <span className="text-xs text-gray-500">{item.ofertaHorario}</span>
            )}
          </div>
        ),
      },
      {
        key: 'tarifaDescripcion',
        header: 'Tarifa',
        render: (item) => (
          <div className="flex flex-col text-sm leading-5 text-gray-800">
            <span className="font-semibold">Montos</span>
            <span className="text-xs text-gray-500">{item.tarifaDescripcion ?? '--'}</span>
          </div>
        ),
      },
      { key: 'periodoMes', header: 'Mes', className: 'text-center font-medium' },
      {
        key: 'concepto',
        header: 'Concepto',
        render: (item) => <span className="whitespace-pre-wrap text-sm">{item.concepto}</span>,
      },
      {
        key: 'monto',
        header: 'Monto',
        className: 'text-center font-semibold',
        render: (item) => formatCurrency(item.monto),
      },
    ];

    if (!estado) {
      cols.push({
        key: 'estado',
        header: 'Estado',
        className: 'text-center uppercase text-xs font-semibold',
      });
    }

    cols.push({
      key: 'cargoId',
      header: 'Acciones',
      className: 'text-center',
      render: (item) => (
        <div className="flex items-center justify-center gap-2">
          <Button size="sm" variant="secondary" onClick={() => onEditar(item)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Button size="sm" variant="danger" onClick={() => onAnular(item)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Anular
          </Button>
          <Button size="sm" onClick={() => onAbrirRecibo(item)} variant="primary">
            <FileText className="mr-2 h-4 w-4" />
            Generar recibo
          </Button>
        </div>
      ),
    });

    return cols;
  }, [estado, onAbrirRecibo, onAnular, onEditar]);

  const filtrosResumen = useMemo(() => {
    const parts: string[] = [];
    if (ofertaId) {
      const match = ofertaOptions.find((opt) => opt.value === ofertaId);
      parts.push(match?.label ?? `Oferta ${ofertaId.slice(0, 8).toUpperCase()}...`);
    }
    if (periodoMes) parts.push(`Mes: ${periodoMes}`);
    if (estado) parts.push(`Estado: ${estado}`);
    return parts;
  }, [estado, ofertaId, ofertaOptions, periodoMes]);

  const filtrosLabel = filtrosResumen.length > 0 ? filtrosResumen.join(' | ') : 'Sin filtros especificos';
  const filtrosAccent: 'white' | 'yellow' = filtrosResumen.length > 0 ? 'white' : 'yellow';
  const heroTotal = cargando ? '...' : cargos.length;

  const abrirNuevoCargo = () => {
    setCargoSeleccionado(null);
    setNuevoCargo({
      tarifaId: '',
      periodoMes: MES_ENUM[0],
      concepto: 'Mensualidad',
      monto: 0,
    });
    setConceptoPreset('Mensualidad');
    setEstadoEdicion('PENDIENTE');
    setShowNuevoCargo(true);
  };

  const guardarCargo = async () => {
    try {
      if (conceptoPreset === 'Otros' && !nuevoCargo.concepto.trim()) {
        notify({
          title: 'Concepto requerido',
          description: 'Ingresa un concepto cuando selecciones la opcion Otros.',
          variant: 'warning',
        });
        return;
      }
      if (cargoSeleccionado) {
        await actualizarCargo(cargoSeleccionado.cargoId, {
          periodoMes: nuevoCargo.periodoMes,
          concepto: nuevoCargo.concepto,
          monto: Number(nuevoCargo.monto),
          estado: estadoEdicion,
        });
        notify({ title: 'Cargo actualizado', variant: 'success' });
      } else {
        if (!nuevoCargo.tarifaId) {
          notify({ title: 'Falta tarifa', description: 'Selecciona una tarifa.', variant: 'warning' });
          return;
        }
        await crearCargo({
          tarifaId: nuevoCargo.tarifaId,
          periodoMes: nuevoCargo.periodoMes,
          concepto: nuevoCargo.concepto,
          monto: Number(nuevoCargo.monto),
          estado: 'PENDIENTE',
        });
        notify({ title: 'Cargo creado', variant: 'success' });
      }
      setShowNuevoCargo(false);
      await buscarCargos();
    } catch {
      notify({ title: 'Error', description: 'No se pudo guardar el cargo.', variant: 'error' });
    }
  };

  const tarifaSelectOptions = useMemo(() => {
    const subset = tarifasDisponibles.filter((tarifa) => !ofertaId || tarifa.ofertaId === ofertaId);
    const base = subset.length > 0 ? subset : tarifasDisponibles;
    return base.map((tarifa) => {
      const institutoLabel = tarifa.institutoNombre ?? 'Instituto no asignado';
      const helperLines = [
        `Instituto: ${institutoLabel}`,
        tarifa.ofertaHorario ? `Horario: ${tarifa.ofertaHorario}` : null,
        `Tarifa: ${tarifa.descripcion}`,
      ].filter(Boolean);

      return {
        label: tarifa.ofertaNombre,
        value: tarifa.tarifaId,
        helper: helperLines.join('\n'),
      };
    });
  }, [tarifasDisponibles, ofertaId]);

  return (
    <Page
      title="Plantillas de cargo"
      description="Gestiona plantillas reutilizables por oferta y periodo. Los filtros se aplican automaticamente."
    >
        <HeroSummary
          title="Plantillas de cargo"
          total={heroTotal}
          filtersLabel={filtrosLabel}
          filtersAccent={filtrosAccent}
        />

        <PanelCard className="relative z-20 px-5 py-5">
          <div className="grid gap-3 md:grid-cols-12 md:items-end">
            <div className="md:col-span-4">
              <NiceSelect
                label="Oferta"
                placeholder={loadingOfertas ? 'Cargando ofertas...' : 'Todas las ofertas'}
                value={ofertaId}
                onChange={(value) => setOfertaId(value)}
                options={ofertaOptions}
                disabled={loadingOfertas}
              />
            </div>
            <div className="md:col-span-4">
              <NiceSelect
                label="Mes (periodo)"
                placeholder="Todos"
                value={periodoMes}
                onChange={(value) => setPeriodoMes(value)}
                options={[{ label: 'Todos', value: '' }, ...toOptions(MES_ENUM)]}
                disabled={loadingTarifas}
              />
            </div>
            <div className="md:col-span-4">
              <NiceSelect
                label="Estado"
                placeholder="Todos"
                value={estado}
                onChange={(value) => setEstado(value)}
                options={[{ label: 'Todos', value: '' }, ...toOptions(CARGO_ESTADO_ENUM)]}
                disabled={loadingTarifas}
              />
            </div>
            <div className="md:col-span-12 flex flex-col gap-3 pt-3 md:flex-row md:items-center md:justify-between">
              <p className="text-xs text-[#667085]">
                {filtrosResumen.length > 0
                  ? `Filtros activos: ${filtrosLabel}`
                  : 'Sin filtros aplicados; se muestran todas las tarifas disponibles.'}
              </p>
              <div className="flex flex-wrap justify-end gap-2">
                <Button variant="secondary" onClick={() => void buscarCargos()} disabled={loadingTarifas || cargando}>
                  <RotateCw className="mr-2 h-4 w-4" />
                  {cargando ? 'Actualizando...' : 'Refrescar'}
                </Button>
                <Button onClick={abrirNuevoCargo} variant="primary">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo cargo
                </Button>
              </div>
            </div>
          </div>
        </PanelCard>

        {cargando ? (
          <PanelCard className="flex justify-center px-6 py-16">
            <Spinner size="lg" />
          </PanelCard>
        ) : (
          <PanelCard className="relative z-10 px-0 py-0">
            <ScrollX className="-mx-4 px-4 md:mx-0 md:px-0">
              <Table
                className="min-w-[960px]"
                data={cargos}
                columns={columns}
                emptyMessage={
                  loadingTarifas
                    ? 'Cargando tarifas y cargos...'
                    : 'No hay cargos para los filtros seleccionados.'
                }
                getRowKey={(item) => item.cargoId}
                classNameHeader={cls.tableHeader}
                classNameRow={cls.tableRow}
              />
            </ScrollX>
          </PanelCard>
        )}

      <Modal
        isOpen={showNuevoCargo}
        onClose={() => setShowNuevoCargo(false)}
        title={cargoSeleccionado ? 'Editar cargo' : 'Nuevo cargo'}
      >
        <div className="grid gap-4">
          {!cargoSeleccionado && (
            <NiceSelect
              label="Tarifa"
              value={nuevoCargo.tarifaId}
              onChange={(value) => setNuevoCargo((prev) => ({ ...prev, tarifaId: value }))}
              options={tarifaSelectOptions}
              placeholder="Selecciona una tarifa"
              disabled={tarifaSelectOptions.length === 0}
              error={tarifaSelectOptions.length === 0 ? 'No hay tarifas disponibles.' : undefined}
              header="Tarifas disponibles"
            />
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <NiceSelect
              label="Mes (periodo)"
              value={nuevoCargo.periodoMes}
              onChange={(value) =>
                setNuevoCargo((prev) => ({ ...prev, periodoMes: value as Mes }))
              }
              options={toOptions(MES_ENUM)}
            />
            <NiceSelect
              label="Concepto"
              value={conceptoPreset}
              onChange={(value) => setConceptoPreset(value as ConceptoPreset)}
              options={CONCEPTO_PRESET_OPTIONS.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
            />
          </div>
          {conceptoPreset === 'Otros' ? (
            <Input
              label="Concepto personalizado"
              placeholder="Describe el concepto"
              value={nuevoCargo.concepto}
              onChange={(event) =>
                setNuevoCargo((prev) => ({ ...prev, concepto: event.target.value }))
              }
              maxLength={30}
            />
          ) : null}
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Monto (Q)"
              type="number"
              min="0"
              step="0.01"
              value={String(nuevoCargo.monto)}
              onChange={(event) =>
                setNuevoCargo((prev) => {
                  const raw = event.target.value;
                  const parsed = Number(raw);
                  return { ...prev, monto: Number.isNaN(parsed) ? 0 : parsed };
                })
              }
              disabled={!isMontoEditable}
              hint={montoHint}
            />
            {cargoSeleccionado && (
              <NiceSelect
                label="Estado"
                value={estadoEdicion}
                onChange={(value) => setEstadoEdicion(value as CargoEstado)}
                options={CARGO_ESTADO_ENUM.map((value) => ({ label: value, value }))}
              />
            )}
          </div>
          <div className="mt-6 flex justify-end gap-2 border-t border-[rgba(0,102,204,0.12)] pt-4">
            <Button variant="secondary" onClick={() => setShowNuevoCargo(false)}>
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={guardarCargo} variant="primary">
              <Save className="mr-2 h-4 w-4" />
              {cargoSeleccionado ? 'Guardar cambios' : 'Guardar cargo'}
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showGenerarRecibo}
        onClose={() => {
          setShowGenerarRecibo(false);
          setAlumnosDeOferta([]);
          resetAlumnoSelection();
        }}
        title="Generar recibo"
      >
        <div className="grid gap-4">
          {cargoSeleccionado && (
            <div className="rounded-2xl border border-[#cfe0f7] bg-[rgba(229,242,255,0.45)] px-4 py-4 text-sm text-[#1f3c63] shadow-[0_18px_36px_-30px_rgba(0,68,140,0.35)]">
              <p className="mb-1 text-base font-semibold text-[#1f3c63]">
                {cargoSeleccionado.ofertaNombre ?? 'Oferta sin nombre'}
              </p>
              {(cargoSeleccionado.ofertaHorario || cargoSeleccionado.institutoNombre) && (
                <p className="mb-2 text-xs text-[#486284]">
                  {cargoSeleccionado.ofertaHorario ?? 'Horario no disponible'}
                  {cargoSeleccionado.institutoNombre ? ` | ${cargoSeleccionado.institutoNombre}` : ''}
                </p>
              )}
              <p className="text-sm">
                <span className="font-semibold text-[#1f3c63]">Concepto:</span>{' '}
                {cargoSeleccionado.concepto}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-[#1f3c63]">Periodo:</span>{' '}
                {cargoSeleccionado.periodoMes}
              </p>
              <p className="text-sm">
                <span className="font-semibold text-[#1f3c63]">Monto original:</span>{' '}
                {formatCurrency(cargoSeleccionado.monto)}
              </p>
              {cargoSeleccionado.tarifaDescripcion && (
                <p className="text-sm">
                  <span className="font-semibold text-[#1f3c63]">Tarifa:</span>{' '}
                  {cargoSeleccionado.tarifaDescripcion}
                </p>
              )}
            </div>
          )}

          <Input
            label="Buscar alumno"
            placeholder="Nombre o carnet"
            value={alumnoFiltro}
            onChange={(event) => setAlumnoFiltro(event.target.value)}
          />

          <NiceSelect
            label="Alumno"
            placeholder={alumnoPlaceholder}
            value={genRecibo.alumnoId}
            onChange={(value) =>
              setGenRecibo((prev) => ({ ...prev, alumnoId: value }))
            }
            options={alumnosFiltrados.map((option) => ({
              value: String(option.value),
              label: option.label ?? String(option.value),
            }))}
            disabled={loadingAlumnosOferta || alumnosFiltrados.length === 0}
          />

          <Input
            label="Monto aplicado (Q)"
            type="number"
            min="0"
            step="0.01"
            value={genRecibo.montoAplicado.toFixed(2)}
            readOnly
            className="cursor-not-allowed bg-[rgba(229,242,255,0.5)] text-[#1f3c63]"
          />
          <Input
            label="Numero de pagos"
            type="number"
            min="1"
            step="1"
            value={String(genRecibo.numeroPagos)}
            onChange={(event) => {
              const nextPagos = Math.max(1, Number(event.target.value) || 1);
              setGenRecibo((prev) => ({
                ...prev,
                numeroPagos: nextPagos,
                montoAplicado: roundAmount(prev.montoUnitario * nextPagos),
              }));
            }}
          />
          <p className="-mt-2 text-xs text-[#486284]">
            El monto aplicado se calcula automaticamente segun el numero de pagos.
          </p>

          <Input
            label="Fecha"
            type="date"
            value={genRecibo.fecha}
            onChange={(event) =>
              setGenRecibo((prev) => ({ ...prev, fecha: event.target.value }))
            }
          />

          <div className="mt-6 flex justify-end gap-2 border-t border-[rgba(0,102,204,0.12)] pt-4">
            <Button
              variant="secondary"
              onClick={() => {
                setShowGenerarRecibo(false);
                setAlumnosDeOferta([]);
                resetAlumnoSelection();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
            <Button onClick={generarRecibo} disabled={loadingAlumnosOferta || loadingAlumnoOptions} variant="primary">
              <Printer className="mr-2 h-4 w-4" />
              Generar e imprimir
            </Button>
          </div>
        </div>
      </Modal>
    </Page>
  );
};

export default CargosList;