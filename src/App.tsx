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
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | any
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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    console.log('Datos del formulario:', formData)
    // Aquí implementaremos la generación del documento Word
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
                Generador de Evidencias QA
              </Typography>
              <Box sx={{ position: 'absolute', right: 16, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 40, height: 40, backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography sx={{ color: '#EC0000', fontWeight: 'bold', fontSize: '18px' }}>S</Typography>
                </Box>
              </Box>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <Paper elevation={0} sx={{ p: 4, mb: 3, width: '100%', maxWidth: '100%' }}>
              <Typography variant="h4" gutterBottom align="center" sx={{ mb: 3 }}>
                Generación de Evidencias de Pruebas
              </Typography>
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
                  <Typography variant="h6" gutterBottom align="center" sx={{ color: '#EC0000', fontWeight: 600 }}>
                    Evidencias Visuales
                  </Typography>
                  
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
                © Santander Consumer Bank - Equipo Calidad
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Sistema de Generación de Evidencias QA - {new Date().getFullYear()}
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
