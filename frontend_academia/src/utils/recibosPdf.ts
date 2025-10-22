import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export type ReciboPdfDetalle = {
  cargoId: string
  periodoMes: string | null
  concepto: string | null
  montoOriginal: number | null
  montoAplicado: number | null
}

export type ReciboPdfOferta = {
  ofertaId: string
  nombre: string
  instituto: string | null
  grado: string | null
  dia: string | null
  horaInicio: string | null
  horaFinalizacion: string | null
}

export type ReciboPdfData = {
  correlativo: string | null
  alumnoNombre: string
  encargados: string[]
  fechaEmision: string | null
  estado: string | null
  total: number | null
  montoBase: number | null
  numeroPagos: number | null
  ofertas: ReciboPdfOferta[]
  detalles: ReciboPdfDetalle[]
}

const formatNumber = (value: number, options?: Intl.NumberFormatOptions) =>
  value.toLocaleString('es-GT', options)

export const formatCurrency = (value: number | null | undefined) => {
  if (typeof value !== 'number') return '-'
  return `Q ${formatNumber(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export const formatPaymentCount = (value: number | null | undefined) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-'
  if (Number.isInteger(value)) return String(value)
  return formatNumber(value, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

let logoDataUrl: string | null = null

const lightenChannel = (channel: number, amount: number) =>
  Math.min(255, Math.round(channel + (255 - channel) * amount))

const lightenColor = (color: [number, number, number], amount: number): [number, number, number] => [
  lightenChannel(color[0], amount),
  lightenChannel(color[1], amount),
  lightenChannel(color[2], amount),
]

const loadLogoDataUrl = async (): Promise<string | null> => {
  if (logoDataUrl !== null) return logoDataUrl
  try {
    const response = await fetch('/logo.png')
    if (!response.ok) return null
    const blob = await response.blob()
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(String(reader.result))
      reader.onerror = () => reject(new Error('No se pudo leer el logo'))
      reader.readAsDataURL(blob)
    })
    logoDataUrl = dataUrl
    return dataUrl
  } catch {
    logoDataUrl = null
    return null
  }
}

type JsPdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY?: number | null } }

export const generarReciboPdf = async (detalle: ReciboPdfData) => {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'letter' })
  const docWithAuto = doc as JsPdfWithAutoTable
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const marginX = 18

  let cursorY = 18

  const logoData = await loadLogoDataUrl()

  doc.setFillColor(240, 246, 255)
  doc.setDrawColor(214, 228, 247)
  doc.roundedRect(marginX, cursorY, pageWidth - marginX * 2, 34, 4, 4, 'F')

  if (logoData) {
    doc.addImage(logoData, 'PNG', marginX + 6, cursorY + 5, 22, 22)
  }

  doc.setTextColor(42, 64, 92)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text('ACADEMIA DE COMPUTACION "CTI"', pageWidth / 2, cursorY + 13, { align: 'center' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text('Centro Tecnico de Informatica - San Pedro Necta', pageWidth / 2, cursorY + 21, {
    align: 'center',
  })
  doc.text('Huehuetenango, Guatemala', pageWidth / 2, cursorY + 28, { align: 'center' })

  cursorY += 42

  doc.setTextColor(54, 68, 88)
  doc.setFillColor(250, 252, 255)
  doc.setDrawColor(228, 236, 249)
  doc.roundedRect(marginX, cursorY, pageWidth - marginX * 2, 42, 3, 3, 'FD')

  const infoPairs: Array<{ label: string; value: string }> = [
    { label: 'Correlativo', value: detalle.correlativo ?? 'N/A' },
    { label: 'Alumno', value: detalle.alumnoNombre },
    {
      label: 'Encargados',
      value: detalle.encargados.length > 0 ? detalle.encargados.join(', ') : 'Sin encargados',
    },
    { label: 'Fecha emision', value: detalle.fechaEmision ?? 'Sin fecha' },
    { label: 'Estado', value: detalle.estado ?? 'EMITIDO' },
  ]

  const infoColumnWidth = (pageWidth - marginX * 2 - 24) / 2
  let infoY = cursorY + 12

  infoPairs.forEach((pair, index) => {
    const col = index % 2
    if (index > 0 && col === 0) {
      infoY += 12
    }
    const baseX = marginX + 10 + col * infoColumnWidth
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text(pair.label, baseX, infoY)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(pair.value, baseX, infoY + 4)
  })

  cursorY += 48

  const summaryData: Array<{ title: string; value: string; accent: [number, number, number] }> = [
    {
      title: 'Monto tarifa base',
      value: formatCurrency(detalle.montoBase),
      accent: [148, 204, 185],
    },
    {
      title: 'Total del recibo',
      value: formatCurrency(detalle.total),
      accent: [167, 191, 242],
    },
    {
      title: 'Numero de pagos',
      value: formatPaymentCount(detalle.numeroPagos),
      accent: [238, 198, 164],
    },
  ]

  const cardWidth = (pageWidth - marginX * 2 - 12) / 3
  const cardHeight = 32

  summaryData.forEach((card, index) => {
    const cardX = marginX + index * (cardWidth + 6)
    const background = lightenColor(card.accent, 0.7)
    const border = lightenColor(card.accent, 0.45)
    doc.setFillColor(...background)
    doc.setDrawColor(...border)
    doc.roundedRect(cardX, cursorY, cardWidth, cardHeight, 3, 3, 'FD')
    doc.setTextColor(card.accent[0], card.accent[1], card.accent[2])
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text(card.title, cardX + 5, cursorY + 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(13)
    doc.setTextColor(34, 41, 57)
    doc.text(card.value, cardX + 5, cursorY + 18)
  })

  cursorY += cardHeight + 12

  if (detalle.ofertas.length > 0) {
    autoTable(doc, {
      theme: 'grid',
      head: [['Oferta', 'Instituto', 'Horario']],
      body: detalle.ofertas.map((oferta) => {
        const horarioPartes: string[] = []
        if (oferta.dia) horarioPartes.push(oferta.dia)
        if (oferta.horaInicio && oferta.horaFinalizacion) {
          horarioPartes.push(`${oferta.horaInicio} - ${oferta.horaFinalizacion}`)
        } else if (oferta.horaInicio) {
          horarioPartes.push(oferta.horaInicio)
        } else if (oferta.horaFinalizacion) {
          horarioPartes.push(oferta.horaFinalizacion)
        }
        return [
          oferta.nombre,
          oferta.instituto ?? 'No asignado',
          horarioPartes.length > 0 ? horarioPartes.join(' | ') : 'Horario no disponible',
        ]
      }),
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      tableWidth: pageWidth - marginX * 2,
      styles: { fontSize: 10, textColor: [50, 63, 83], lineColor: [226, 232, 240], lineWidth: 0.25 },
      headStyles: { fillColor: [213, 229, 249], textColor: [44, 59, 81], halign: 'left', fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [243, 248, 255] },
    })
    cursorY = (docWithAuto.lastAutoTable?.finalY ?? cursorY) + 10
  } else {
    doc.setFontSize(10)
    doc.text('No hay ofertas asociadas a este recibo.', marginX, cursorY)
    cursorY += 10
  }

  const detalleBody =
    detalle.detalles.length > 0
      ? detalle.detalles.map((item) => [
          item.periodoMes ?? 'Sin periodo',
          item.concepto ?? 'Sin concepto',
          formatCurrency(item.montoOriginal),
          formatCurrency(item.montoAplicado),
        ])
      : [['-', '-', '-', '-']]

  autoTable(doc, {
    theme: 'grid',
    head: [['Mes pagado', 'Concepto', 'Monto original', 'Monto aplicado']],
    body: detalleBody,
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    tableWidth: pageWidth - marginX * 2,
    styles: { fontSize: 10, textColor: [50, 63, 83], lineColor: [226, 232, 240], lineWidth: 0.25 },
    headStyles: { fillColor: [237, 223, 250], textColor: [72, 49, 103], halign: 'left', fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [250, 245, 255] },
  })

  cursorY = (docWithAuto.lastAutoTable?.finalY ?? cursorY) + 16

  const signatureLineY = Math.max(cursorY, pageHeight - 55)
  doc.setDrawColor(203, 213, 225)
  doc.line(marginX + 20, signatureLineY, pageWidth - marginX - 20, signatureLineY)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text('Firma del encargado de la academia', pageWidth / 2, signatureLineY + 5, {
    align: 'center',
  })

  doc.setFontSize(9)
  doc.setTextColor(71, 85, 105)
  doc.text(
    'Gracias por confiar en la Academia de Computacion CTI.',
    pageWidth / 2,
    pageHeight - 20,
    { align: 'center' },
  )
  doc.text(
    'Este recibo es valido unicamente con firma y sello autorizados.',
    pageWidth / 2,
    pageHeight - 14,
    { align: 'center' },
  )

  const correlativoSeguro = (detalle.correlativo ?? 'SIN-CORRELATIVO').replace(
    /[^A-Z0-9-]+/gi,
    '-',
  )

  doc.save(`RECIBO-${correlativoSeguro}.pdf`)
}
