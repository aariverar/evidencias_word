import { useState, useRef, useCallback } from 'react'
import { 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  ThemeProvider,
  createTheme,
  AppBar,
  Toolbar,
  Modal,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Tooltip
} from '@mui/material'
import type { SelectChangeEvent } from '@mui/material'
import { 
  CloudUpload, 
  Close, 
  Edit, 
  Delete, 
  DragIndicator, 
  Image as ImageIcon, 
  Add,
  Visibility,
  Save
} from '@mui/icons-material'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { es } from 'date-fns/locale'
import './App.css'

// Librerías para generar documentos Word
import Docxtemplater from 'docxtemplater'
import PizZip from 'pizzip'
import { saveAs } from 'file-saver'

// Tema personalizado de Santander
const santanderTheme = createTheme({
  palette: {
    primary: {
      main: '#EC0000', // Rojo Santander
      light: '#FF4444',
      dark: '#B30000',
      contrastText: '#FFFFFF'
    },
    secondary: {
      main: '#FFFFFF',
      dark: '#F5F5F5',
      contrastText: '#EC0000'
    },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF'
    },
    text: {
      primary: '#333333',
      secondary: '#666666'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
      color: '#EC0000'
    },
    h6: {
      fontWeight: 500,
      color: '#333333'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        contained: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '12px 24px'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&:hover fieldset': {
              borderColor: '#EC0000',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 20px rgba(236, 0, 0, 0.1)'
        }
      }
    }
  }
})

interface EvidenceForm {
  cicloSprint: string
  analistaQA: string
  casoPrueba: string
  proyectoEquipo: string
  fechaEjecucion: Date | null
  estado: string
}

interface ImageFile {
  id: string
  file: File
  name: string
  preview: string
  originalName: string
  order: number
}

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<EvidenceForm>({
    cicloSprint: '',
    analistaQA: '',
    casoPrueba: '',
    proyectoEquipo: '',
    fechaEjecucion: null,
    estado: ''
  })

  const [images, setImages] = useState<ImageFile[]>([])
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingImage, setEditingImage] = useState<ImageFile | null>(null)
  const [newImageName, setNewImageName] = useState('')
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleInputChange = (field: keyof EvidenceForm) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    })
  }

  const handleDateChange = (date: Date | null) => {
    setFormData({
      ...formData,
      fechaEjecucion: date
    })
  }

  // Funciones para manejo de imágenes
  const handleFileSelect = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const validFiles = fileArray.filter(file => file.type.startsWith('image/'))
    
    const newImages: ImageFile[] = validFiles.map((file, index) => ({
      id: `img_${Date.now()}_${index}`,
      file,
      name: file.name.split('.')[0],
      preview: URL.createObjectURL(file),
      originalName: file.name,
      order: images.length + index
    }))

    setImages(prev => [...prev, ...newImages])
  }, [images.length])

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      handleFileSelect(files)
    }
  }

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    const files = event.dataTransfer.files
    if (files) {
      handleFileSelect(files)
    }
  }, [handleFileSelect])

  const openImageModal = () => {
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  const deleteImage = (id: string) => {
    setImages(prev => {
      const filtered = prev.filter(img => img.id !== id)
      // Reordenar los índices
      return filtered.map((img, index) => ({ ...img, order: index }))
    })
  }

  const startEditImage = (image: ImageFile) => {
    setEditingImage(image)
    setNewImageName(image.name)
    setIsEditDialogOpen(true)
  }

  const saveImageName = () => {
    if (editingImage && newImageName.trim()) {
      setImages(prev => 
        prev.map(img => 
          img.id === editingImage.id 
            ? { ...img, name: newImageName.trim() }
            : img
        )
      )
      setIsEditDialogOpen(false)
      setEditingImage(null)
      setNewImageName('')
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    setImages(prev => {
      const newImages = [...prev]
      const [removed] = newImages.splice(fromIndex, 1)
      newImages.splice(toIndex, 0, removed)
      // Actualizar los órdenes
      return newImages.map((img, index) => ({ ...img, order: index }))
    })
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleImageDragOver = (event: React.DragEvent, index: number) => {
    event.preventDefault()
    if (draggedIndex !== null && draggedIndex !== index) {
      moveImage(draggedIndex, index)
      setDraggedIndex(index)
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    
    // Validar que todos los campos estén completos
    if (!formData.cicloSprint || !formData.analistaQA || !formData.casoPrueba || 
        !formData.proyectoEquipo || !formData.fechaEjecucion || !formData.estado) {
      alert('Por favor, completa todos los campos del formulario')
      return
    }

    try {
      await generateWordDocument()
      alert('¡Documento generado exitosamente!')
    } catch (error) {
      console.error('Error generando documento:', error)
      alert('Error al generar el documento. Revisa la consola para más detalles.')
    }
  }

  // Función que replica add_images_to_doc del utilities.py
  const addImagesToDoc = async (doc: Docxtemplater, imageFiles: ImageFile[]) => {
    try {
      console.log('🖼️ Iniciando add_images_to_doc (replicando utilities.py)...')
      
      // Obtener el ZIP del documento para manipular el XML
      const zip = doc.getZip()
      
      // Leer el document.xml actual
      const documentXml = zip.file('word/document.xml').asText()
      
      // Asegurar que existe el directorio media
      if (!zip.file('word/media/')) {
        zip.folder('word/media')
      }
      
      // Crear el XML para las imágenes (una por una, con título y imagen)
      let imagesXml = ''
      
      for (let i = 0; i < imageFiles.length; i++) {
        const image = imageFiles[i]
        
        try {
          // 1. Obtener los datos de la imagen
          const response = await fetch(image.preview)
          const arrayBuffer = await response.arrayBuffer()
          const imageData = new Uint8Array(arrayBuffer)
          
          console.log(`📷 Procesando imagen ${i + 1}: ${image.name}, tamaño: ${imageData.length} bytes`)
          
          // 1.5. Calcular dimensiones de la imagen para mostrarla completa
          const img = new Image()
          const imageUrl = URL.createObjectURL(new Blob([imageData]))
          
          await new Promise((resolve) => {
            img.onload = resolve
            img.src = imageUrl
          })
          
          // Calcular tamaño para Word (manteniendo proporciones)
          const maxWidthCm = 15.00 // Ancho máximo exacto para aprovechar el ancho del Word
          
          const widthCm = Math.min(maxWidthCm, (img.width * maxWidthCm) / Math.max(img.width, img.height))
          const heightCm = (widthCm * img.height) / img.width
          
          // Convertir a EMUs (English Metric Units) para Word
          const widthEmu = Math.round(widthCm * 360000)  // 1cm = 360000 EMUs
          const heightEmu = Math.round(heightCm * 360000)
          
          console.log(`📐 Imagen ${i + 1}: ${img.width}x${img.height}px -> ${widthCm.toFixed(1)}x${heightCm.toFixed(1)}cm (${widthEmu}x${heightEmu} EMUs)`)
          
          // Limpiar URL temporal
          URL.revokeObjectURL(imageUrl)
          
          // 2. Determinar extensión
          let extension = 'png'
          if (image.file.type.includes('jpeg') || image.file.type.includes('jpg')) {
            extension = 'jpeg'
          }
          
          // 3. Generar nombre único para la imagen (con timestamp para garantizar unicidad)
          const timestamp = Date.now()
          const imageName = `custom_img_${timestamp}_${i + 1}.${extension}`
          
          // 4. Agregar la imagen al ZIP del documento
          zip.file(`word/media/${imageName}`, imageData)
          console.log(`💾 Imagen guardada como: word/media/${imageName}`)
          
          // 5. Crear el título numerado para la imagen
          const getNumberedTitle = (title: string, index: number) => `${index + 1}. ${title}`
          const imageTitle = getNumberedTitle(image.name.replace(/\.[^/.]+$/, ''), i)
          // 6. Agregar título e imagen usando XML básico y seguro
          // NOTA: Usamos IDs muy altos y únicos para evitar cualquier conflicto
          const baseId = 5000 + (i * 100) // 5000, 5100, 5200, etc. - números muy altos
          const relationshipId = `rId${baseId}`
          const docPrId = baseId + 50 // ID diferente para docPr (5050, 5150, etc.)
          console.log(`🔗 Usando IDs ultra-seguros: rel=${relationshipId}, docPr=${docPrId} -> media/${imageName} (100% separado de plantilla)`)
          imagesXml += `
            <w:p>
              <w:pPr>
                <w:ind w:left="567"/>
                <w:pStyle w:val="Heading3"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
                  <w:sz w:val="22"/>
                </w:rPr>
                <w:t>${imageTitle}</w:t>
              </w:r>
              <w:r><w:br/></w:r>
            </w:p>
            <w:p>
              <w:pPr>
                <w:jc w:val="center"/>
              </w:pPr>
              <w:r>
                <w:rPr>
                  <w:noProof/>
                </w:rPr>
                <w:drawing>
                  <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
                    <wp:extent cx="${widthEmu}" cy="${heightEmu}"/>
                    <wp:docPr id="${docPrId}" name="${imageName}"/>
                    <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                      <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                        <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                          <pic:nvPicPr>
                            <pic:cNvPr id="${docPrId}" name="${imageName}"/>
                            <pic:cNvPicPr/>
                          </pic:nvPicPr>
                          <pic:blipFill>
                            <a:blip r:embed="${relationshipId}"/>
                            <a:stretch>
                              <a:fillRect/>
                            </a:stretch>
                          </pic:blipFill>
                          <pic:spPr>
                            <a:xfrm>
                              <a:off x="0" y="0"/>
                              <a:ext cx="${widthEmu}" cy="${heightEmu}"/>
                            </a:xfrm>
                            <a:prstGeom prst="rect"/>
                          </pic:spPr>
                        </pic:pic>
                      </a:graphicData>
                    </a:graphic>
                  </wp:inline>
                </w:drawing>
              </w:r>
            </w:p>
            <w:p/>
          `
          
          // 7. Agregar la nueva relación con ID ultra-seguro
          const relsXml = zip.file('word/_rels/document.xml.rels').asText()
          
          // Verificar que NO estamos sobrescribiendo ninguna relación existente
          if (relsXml.includes(relationshipId)) {
            console.error(`⚠️ CONFLICTO: ${relationshipId} ya existe en la plantilla!`)
          }
          
          const newRelXml = relsXml.replace(
            '</Relationships>',
            `<Relationship Id="${relationshipId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/${imageName}"/></Relationships>`
          )
          zip.file('word/_rels/document.xml.rels', newRelXml)
          console.log(`✅ Relación ${relationshipId} agregada correctamente (ultra-segura para plantilla)`)
          
          // 8. Agregar tipo de contenido para la imagen
          const contentTypesXml = zip.file('[Content_Types].xml').asText()
          const imageExtension = extension === 'jpeg' ? 'jpeg' : 'png'
          const contentType = extension === 'jpeg' ? 'image/jpeg' : 'image/png'
          
          if (!contentTypesXml.includes(`Extension="${imageExtension}"`)) {
            const newContentTypesXml = contentTypesXml.replace(
              '</Types>',
              `<Default Extension="${imageExtension}" ContentType="${contentType}"/></Types>`
            )
            zip.file('[Content_Types].xml', newContentTypesXml)
            console.log(`📄 Tipo de contenido agregado para .${imageExtension}`)
          }
          
          console.log(`✅ Imagen ${i + 1} (${image.name}) procesada para el documento`)
          
        } catch (error) {
          console.error(`❌ Error al procesar imagen ${i + 1}:`, error)
        }
      }
      
      // 8. Agregar las imágenes al final del documento (antes de </w:body>)
      if (imagesXml) {
        const updatedDocumentXml = documentXml.replace(
          '</w:body>',
          `${imagesXml}</w:body>`
        )
        zip.file('word/document.xml', updatedDocumentXml)
        
        console.log(`✅ ${imageFiles.length} imágenes agregadas al documento`)
      }
      
    } catch (error) {
      console.error('💥 Error en add_images_to_doc:', error)
      throw error
    }
  }

  const generateWordDocument = async () => {
    try {
      console.log('Iniciando generación de documento Word...')
      
      // Obtener la base URL actual y construir la ruta correcta
      const baseUrl = import.meta.env.BASE_URL || '/'
      const templatePath = `${baseUrl}templates/Plantilla.docx`
      console.log('Base URL:', baseUrl)
      console.log('Cargando plantilla desde:', templatePath)
      
      const response = await fetch(templatePath)
      
      if (!response.ok) {
        throw new Error(`No se pudo cargar la plantilla desde ${templatePath}. Status: ${response.status}`)
      }

      const templateBuffer = await response.arrayBuffer()
      console.log('Plantilla cargada, tamaño:', templateBuffer.byteLength, 'bytes')
      
      // Crear el ZIP desde el buffer de la plantilla
      const zip = new PizZip(templateBuffer)
      
      // Crear el documento Docxtemplater con configuración específica para dobles llaves
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: '{{',
          end: '}}'
        },
        errorLogging: false
      })

      // Formatear la fecha
      const fechaFormateada = formData.fechaEjecucion 
        ? formData.fechaEjecucion.toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })
        : ''

      // Crear el contexto con todos los datos del formulario (solo datos básicos)
      const templateData: Record<string, string> = {
        CICLO: formData.cicloSprint,
        ANALISTA: formData.analistaQA,
        CASOPRUEBA: formData.casoPrueba,
        PROYECTO: formData.proyectoEquipo,
        FECHA: fechaFormateada,
        ESTADO: formData.estado
      }

      console.log('📋 Datos para reemplazar en la plantilla:', templateData)

      // Renderizar el documento con los datos y manejo de errores mejorado
      try {
        doc.render(templateData)
        console.log('✅ Documento renderizado exitosamente')
      } catch (error) {
        console.error('❌ Error al renderizar el documento:', error);
        if (error && typeof error === 'object' && 'name' in error && (error as any).name === 'TemplateError') {
          const templateError = error as { name: string; properties?: { errors?: { name?: string; explanation?: string }[] } };
          console.error('Errores de plantilla:', templateError.properties);
          if (templateError.properties && templateError.properties.errors) {
            const errorDetails = templateError.properties.errors.map((err) => 
              `- Variable: ${err.name || 'desconocida'} | Problema: ${err.explanation || 'desconocido'}`
            ).join('\n');
            throw new Error(`Error en la plantilla Word:\n${errorDetails}\n\n📝 IMPORTANTE: Verifica que tu plantilla Plantilla.docx contenga exactamente estas variables:\n{{CICLO}}\n{{ANALISTA}}\n{{CASOPRUEBA}}\n{{PROYECTO}}\n{{FECHA}}\n{{ESTADO}}\n\n⚠️ Asegúrate de usar dobles llaves {{ }} y que no haya espacios dentro de las llaves.`);
          }
        }
        throw new Error(`Error al procesar la plantilla Word: ${(error as Error).message}\n\n💡 Verifica que:\n1. El archivo Plantilla.docx sea válido\n2. Use dobles llaves: {{VARIABLE}}\n3. No tenga espacios dentro de las llaves\n4. Las variables estén escritas exactamente como: CICLO, ANALISTA, CASOPRUEBA, PROYECTO, FECHA, ESTADO`);
      }

      // AQUÍ AGREGAMOS LAS IMÁGENES COMO EN utilities.py (add_images_to_doc)
      if (images.length > 0) {
        console.log('🖼️ Agregando imágenes al documento (replicando add_images_to_doc)...')
        await addImagesToDoc(doc, images)
      }

      // Generar el documento final
      const output = doc.getZip().generate({
        type: 'blob',
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      })

      // Crear nombre del archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:]/g, '-')
      const fileName = `Evidencia_${formData.casoPrueba}_${timestamp}.docx`

      // Descargar el archivo
      saveAs(output, fileName)
      
      console.log('Documento generado exitosamente:', fileName)
      
    } catch (error) {
      console.error('Error detallado:', error)
      throw error
    }
  }

  const resetForm = () => {
    setFormData({
      cicloSprint: '',
      analistaQA: '',
      casoPrueba: '',
      proyectoEquipo: '',
      fechaEjecucion: null,
      estado: ''
    })
    // Limpiar imágenes y liberar memoria
    images.forEach(image => URL.revokeObjectURL(image.preview))
    setImages([])
  }

  return (
    <ThemeProvider theme={santanderTheme}>
      <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
        <Box sx={{ flexGrow: 1, minHeight: '100vh', backgroundColor: '#FFFFFF', width: '100%' }}>
          <AppBar position="static" elevation={0}>
            <Toolbar sx={{ justifyContent: 'center', position: 'relative' }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#FFFFFF' }}>
                Santander - Generador de Evidencias
              </Typography>
              <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 40, height: 40, backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#EC0000', fontWeight: 'bold', fontSize: '18px' }}>QA</Typography>
                </Box>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Paper elevation={0} sx={{ p: 4, mb: 3, width: '100%', maxWidth: '100%' }}>
              <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
                Completa los datos para generar tu documento de evidencias en formato Word
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, 
                  gap: 3,
                  width: '100%',
                  maxWidth: 800
                }}>
                  <TextField
                    fullWidth
                    label="Nombre de Ciclo o Sprint"
                    value={formData.cicloSprint}
                    onChange={handleInputChange('cicloSprint')}
                    placeholder="ej: Sprint 23 - Módulo Pagos"
                    required
                  />
                  
                  <TextField
                    fullWidth
                    label="Analista QA"
                    value={formData.analistaQA}
                    onChange={handleInputChange('analistaQA')}
                    placeholder="ej: María González"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Caso de Prueba"
                    value={formData.casoPrueba}
                    onChange={handleInputChange('casoPrueba')}
                    placeholder="ej: TC001 - Login Usuario"
                    required
                  />

                  <TextField
                    fullWidth
                    label="Proyecto o Equipo"
                    value={formData.proyectoEquipo}
                    onChange={handleInputChange('proyectoEquipo')}
                    placeholder="ej: Proyecto Transformación Digital"
                    required
                  />

                  <DatePicker
                    label="Fecha de Ejecución"
                    value={formData.fechaEjecucion}
                    onChange={handleDateChange}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true
                      }
                    }}
                  />

                  <FormControl fullWidth required>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={formData.estado}
                      label="Estado"
                      onChange={handleInputChange('estado')}
                    >
                      <MenuItem value="PASS">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, backgroundColor: '#4CAF50', borderRadius: '50%' }} />
                          PASS
                        </Box>
                      </MenuItem>
                      <MenuItem value="FAIL">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, backgroundColor: '#F44336', borderRadius: '50%' }} />
                          FAIL
                        </Box>
                      </MenuItem>
                      <MenuItem value="BLOCKED">
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box sx={{ width: 12, height: 12, backgroundColor: '#FF9800', borderRadius: '50%' }} />
                          BLOCKED
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>

                {/* Sección de carga de imágenes */}
                <Box sx={{ mt: 4, width: '100%', maxWidth: 800, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                  
                  {/* Área de drag & drop */}
                  <Box
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    sx={{
                      border: `2px dashed ${isDragOver ? '#EC0000' : '#CCCCCC'}`,
                      borderRadius: 2,
                      p: 3,
                      textAlign: 'center',
                      backgroundColor: isDragOver ? 'rgba(236, 0, 0, 0.05)' : '#F8F9FA',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      width: '100%',
                      '&:hover': {
                        borderColor: '#EC0000',
                        backgroundColor: 'rgba(236, 0, 0, 0.02)'
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />
                    <CloudUpload sx={{ fontSize: 48, color: '#EC0000', mb: 2 }} />
                    <Typography variant="h6" gutterBottom>
                      Arrastra tus imágenes aquí
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      o haz clic para seleccionar archivos
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Formatos soportados: JPG, PNG, GIF, WebP
                    </Typography>
                  </Box>

                  {/* Mostrar imágenes cargadas */}
                  {images.length > 0 && (
                    <Box sx={{ mt: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2, gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Imágenes cargadas ({images.length})
                        </Typography>
                        <Button
                          variant="outlined"
                          startIcon={<Visibility />}
                          onClick={openImageModal}
                          sx={{ 
                            borderColor: '#EC0000',
                            color: '#EC0000',
                            '&:hover': {
                              borderColor: '#B30000',
                              backgroundColor: 'rgba(236, 0, 0, 0.04)'
                            }
                          }}
                        >
                          Gestionar Imágenes
                        </Button>
                      </Box>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        {images.slice(0, 5).map((image) => (
                          <Tooltip key={image.id} title={image.name}>
                            <Box
                              sx={{
                                width: 60,
                                height: 60,
                                borderRadius: 1,
                                overflow: 'hidden',
                                border: '2px solid #E0E0E0',
                                position: 'relative'
                              }}
                            >
                              <img
                                src={image.preview}
                                alt={image.name}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            </Box>
                          </Tooltip>
                        ))}
                        {images.length > 5 && (
                          <Box
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              border: '2px solid #E0E0E0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              backgroundColor: '#F5F5F5'
                            }}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 600, color: '#666' }}>
                              +{images.length - 5}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Box>
                  )}
                </Box>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{ minWidth: 200 }}
                  >
                    📄 Generar Evidencia
                  </Button>
                  <Button
                    type="button"
                    variant="outlined"
                    size="large"
                    onClick={resetForm}
                    sx={{ 
                      minWidth: 150,
                      borderColor: '#EC0000',
                      color: '#EC0000',
                      '&:hover': {
                        borderColor: '#B30000',
                        backgroundColor: 'rgba(236, 0, 0, 0.04)'
                      }
                    }}
                  >
                    🔄 Limpiar
                  </Button>
                </Box>
              </Box>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', backgroundColor: '#F8F9FA', width: '100%', maxWidth: '100%' }}>
              <Typography variant="body2" color="text.secondary">
                💡 Una vez completado el formulario, se generará automáticamente un documento Word con todas las evidencias
              </Typography>
            </Paper>

            {/* Pie de página */}
            <Box sx={{ 
              mt: 4, 
              py: 3, 
              width: '100%', 
              textAlign: 'center', 
              borderTop: '1px solid #E0E0E0',
              backgroundColor: '#FAFAFA'
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                © Santander Consumer Bank - Aseguramiento de Calidad
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Powered by Abraham Rivera | Support: arivera_scb@santander.com.pe - {new Date().getFullYear()}
              </Typography>
            </Box>

            {/* Modal para gestionar imágenes */}
            <Modal
              open={isImageModalOpen}
              onClose={closeImageModal}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Box sx={{
                backgroundColor: 'white',
                borderRadius: 3,
                maxWidth: '90vw',
                maxHeight: '90vh',
                width: 800,
                overflow: 'auto',
                outline: 'none'
              }}>
                <Box sx={{ p: 3, borderBottom: '1px solid #E0E0E0', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                  <Typography variant="h5" sx={{ fontWeight: 600, color: '#EC0000' }}>
                    Gestión de Evidencias Visuales
                  </Typography>
                  <IconButton onClick={closeImageModal} sx={{ color: '#666', position: 'absolute', right: 16 }}>
                    <Close />
                  </IconButton>
                </Box>

                <Box sx={{ p: 3 }}>
                  {images.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <ImageIcon sx={{ fontSize: 64, color: '#CCC', mb: 2 }} />
                      <Typography variant="h6" color="text.secondary">
                        No hay imágenes cargadas
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Agrega imágenes desde el formulario principal
                      </Typography>
                    </Box>
                  ) : (
                    <>
                      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          Total: {images.length} imagen{images.length !== 1 ? 'es' : ''}
                        </Typography>
                        <Chip
                          label="Arrastra para reordenar"
                          variant="outlined"
                          size="small"
                          sx={{ borderColor: '#EC0000', color: '#EC0000' }}
                        />
                      </Box>

                      <Box sx={{ display: 'grid', gap: 2 }}>
                        {images.map((image, index) => (
                          <Box
                            key={image.id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => handleImageDragOver(e, index)}
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                              p: 2,
                              border: '1px solid #E0E0E0',
                              borderRadius: 2,
                              backgroundColor: draggedIndex === index ? 'rgba(236, 0, 0, 0.05)' : 'white',
                              cursor: 'grab',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: '#EC0000',
                                boxShadow: '0 2px 8px rgba(236, 0, 0, 0.1)'
                              },
                              '&:active': {
                                cursor: 'grabbing'
                              }
                            }}
                          >
                            <DragIndicator sx={{ color: '#999', cursor: 'grab' }} />
                            
                            <Box sx={{ position: 'relative' }}>
                              <img
                                src={image.preview}
                                alt={image.name}
                                style={{
                                  width: 80,
                                  height: 80,
                                  objectFit: 'cover',
                                  borderRadius: 8,
                                  border: '1px solid #E0E0E0'
                                }}
                              />
                              <Chip
                                label={index + 1}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: -8,
                                  left: -8,
                                  backgroundColor: '#EC0000',
                                  color: 'white',
                                  fontWeight: 600,
                                  minWidth: 24,
                                  height: 24
                                }}
                              />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                                {image.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Archivo original: {image.originalName}
                              </Typography>
                            </Box>

                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Editar nombre">
                                <IconButton
                                  size="small"
                                  onClick={() => startEditImage(image)}
                                  sx={{ color: '#EC0000' }}
                                >
                                  <Edit />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Eliminar imagen">
                                <IconButton
                                  size="small"
                                  onClick={() => deleteImage(image.id)}
                                  sx={{ color: '#F44336' }}
                                >
                                  <Delete />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        ))}
                      </Box>
                    </>
                  )}

                  <Divider sx={{ my: 3 }} />

                  {/* Botón para agregar más imágenes desde el modal */}
                  <Box sx={{ textAlign: 'center' }}>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                      id="modal-file-input"
                    />
                    <label htmlFor="modal-file-input">
                      <Button
                        variant="outlined"
                        component="span"
                        startIcon={<Add />}
                        sx={{ 
                          borderColor: '#EC0000',
                          color: '#EC0000',
                          '&:hover': {
                            borderColor: '#B30000',
                            backgroundColor: 'rgba(236, 0, 0, 0.04)'
                          }
                        }}
                      >
                        Agregar más imágenes
                      </Button>
                    </label>
                  </Box>
                </Box>
              </Box>
            </Modal>

            {/* Dialog para editar nombre de imagen */}
            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
              <DialogTitle sx={{ color: '#EC0000', fontWeight: 600, textAlign: 'center' }}>
                ✏️ Editar nombre de imagen
              </DialogTitle>
              <DialogContent sx={{ textAlign: 'center', pt: 3 }}>
                <TextField
                  autoFocus
                  fullWidth
                  label="Nuevo nombre"
                  value={newImageName}
                  onChange={(e) => setNewImageName(e.target.value)}
                  variant="outlined"
                  sx={{ mt: 2 }}
                  placeholder="Escribe el nuevo nombre..."
                />
                {editingImage && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                    Archivo original: {editingImage.originalName}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions sx={{ p: 3, justifyContent: 'center', gap: 2 }}>
                <Button 
                  onClick={() => setIsEditDialogOpen(false)}
                  sx={{ color: '#666', minWidth: 100 }}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={saveImageName}
                  variant="contained"
                  startIcon={<Save />}
                  disabled={!newImageName.trim()}
                  sx={{ backgroundColor: '#EC0000', '&:hover': { backgroundColor: '#B30000' }, minWidth: 120 }}
                >
                  Guardar
                </Button>
              </DialogActions>
            </Dialog>
          </Container>
        </Box>
      </LocalizationProvider>
    </ThemeProvider>
  )
}

export default App
