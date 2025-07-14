# 📄 Evidencias Word - Generador de Documentos QA

[![Deploy](https://github.com/aariverar/evidencias_word/actions/workflows/deploy.yml/badge.svg)](https://github.com/aariverar/evidencias_word/actions/workflows/deploy.yml)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-brightgreen)](https://aariverar.github.io/evidencias_word/)

Una aplicación web moderna para generar documentos Word con evidencias de pruebas de calidad, desarrollada con React + TypeScript + Vite.

## 🚀 **Demo en Vivo**
👉 **[Probar la aplicación](https://aariverar.github.io/evidencias_word/)**

## 🌟 **Características Principales**
- ✅ Generación automática de documentos Word (.docx)
- 🖼️ Inserción optimizada de imágenes con redimensionamiento automático
- 📱 Interfaz responsive con diseño moderno
- 🎨 Tema corporativo de Santander
- ⚡ Optimización de imágenes en tiempo real (compresión hasta 90%)
- 🔄 Drag & drop para carga y reordenamiento de imágenes
- 📋 Formularios intuitivos con validación
- 🚀 Despliegue automático con GitHub Pages

## 🛠️ **Tecnologías Utilizadas**
- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **UI Framework**: Material-UI (MUI)
- **Generación Word**: Docxtemplater + PizZip
- **Fechas**: Date-fns con localización en español
- **Despliegue**: GitHub Pages + GitHub Actions

## 📦 **Instalación y Desarrollo**

### Prerrequisitos
- Node.js 18+ 
- npm

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/aariverar/evidencias_word.git
cd evidencias_word

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build
```

### Scripts Disponibles
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de la build
- `npm run lint` - Análisis de código con ESLint

## 🎯 **Funcionalidades Detalladas**

### 📝 **Generación de Documentos**
- Plantillas Word personalizables con variables dinámicas
- Inserción automática de metadatos del proyecto
- Formato profesional con estilos corporativos

### 🖼️ **Gestión de Imágenes**
- Redimensionamiento automático (máx. 800x600px)
- Compresión inteligente con calidad ajustable
- Lazy loading para mejor rendimiento
- Drag & drop con reordenamiento visual
- Vista previa en miniatura

### 🎨 **Interfaz de Usuario**
- Diseño responsive para desktop y móvil
- Tema corporativo de Santander (rojo #EC0000)
- Indicadores de progreso durante procesamiento
- Validación de formularios en tiempo real
- Modales interactivos para gestión de imágenes

## 🔧 **Configuración de GitHub Pages**

Este proyecto está configurado para desplegarse automáticamente en GitHub Pages mediante GitHub Actions.

### Proceso de Despliegue
1. **Push a main** → Activa el workflow automáticamente
2. **Build** → Compila el proyecto con Vite
3. **Deploy** → Publica en GitHub Pages
4. **URL disponible** → `https://aariverar.github.io/evidencias_word/`

## 📋 **Uso de la Aplicación**

1. **Completar formulario**: Llena todos los campos requeridos
2. **Cargar imágenes**: Arrastra o selecciona archivos (JPG, PNG, GIF, WebP)
3. **Gestionar evidencias**: Reordena, edita nombres o elimina imágenes
4. **Generar documento**: Haz clic en "Generar Evidencia"
5. **Descargar**: El archivo .docx se descarga automáticamente

## 🔄 **Historial de Versiones**

- **v1.3** - Optimización completa de carga de imágenes y corrección TypeScript
- **v1.2** - Personalización UI y limpieza de archivos  
- **v1.1** - Implementación completa de inserción de imágenes
- **v1.0** - Generación básica de documentos Word

## 👨‍💻 **Desarrollado por**
**Abraham Rivera** - Analista QA Senior  
📧 arivera_scb@santander.com.pe  
🏢 Santander Consumer Bank

---

## 📚 **Documentación Técnica (React + Vite)**

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
