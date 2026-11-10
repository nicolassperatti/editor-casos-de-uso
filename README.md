# UseCase Studio

Herramienta web interactiva y cliente-servidor cero para la especificación estructurada, modelado y exportación de Casos de Uso según estándares de ingeniería de software.

Diseñada con React 19, TypeScript y Tailwind CSS, funciona 100% en el navegador de manera local, privada y sin dependencias de backend.

---

## ✨ Características Principales

- **Editor Tabular Estructurado:** Especifica actores, disparadores, precondiciones, postcondiciones, ruta principal y flujos alternativos/excepciones con ajuste automático multilínea sin desbordamientos.
- **Pestañas Múltiples:** Trabaja con varios casos de uso en paralelo, con temas de color y modo claro/oscuro independientes por pestaña.
- **Diagramas Mermaid en Tiempo Real:** Generación automática de diagramas de flujo (*Flowchart*) y diagramas de interacción (*Sequence*) con heurística de clasificación actor-sistema.
- **Exportación de Alta Fidelidad:**
  - **PDF Vectorial Multi-página:** Algoritmo de corte inteligente por filas que evita fragmentar texto en saltos de página A4.
  - **PNG HD:** Renderizado off-screen de alta resolución con opción de descarga directa o copia al portapapeles.
  - **JSON Estructurado:** Importación y exportación de esquemas completos validados y sanitizados.
- **Plantillas Predefinidas:** Casos de uso base para autenticación, carritos de compra, operaciones CRUD y trámites académicos.
- **Historial Completo:** Pila de Deshacer / Rehacer de 50 pasos con persistencia local reactiva.
- **Modo Zen:** Vista de lectura y presentación limpia sin barras de herramientas.

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
| :--- | :--- |
| `Ctrl + S` | Confirmación de guardado automático en el navegador |
| `Ctrl + Z` | Deshacer último cambio |
| `Ctrl + Y` / `Ctrl + Shift + Z` | Rehacer último cambio |
| `Ctrl + Alt + N` | Abrir catálogo de plantillas para nueva pestaña |
| `Ctrl + Shift + D` | Abrir visor de diagramas Mermaid |
| `F2` | Alternar Modo Zen (vista limpia) |
| `?` / `F1` | Ver modal de atajos de teclado |
| `Esc` | Cerrar ventana modal activa o salir de Modo Zen |

---

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm 9+

### Instalación y Desarrollo Local
```bash
# Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd editor-caso-de-uso

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor estará disponible en `http://localhost:5173`.

### Pruebas Unitarias
```bash
npm test
```

### Compilación para Producción
```bash
npm run build
```
Los archivos estáticos optimizados se generarán en la carpeta `dist/`.

---

## 🌐 Despliegue en GitHub Pages

Este proyecto utiliza rutas relativas (`base: './'` en `vite.config.ts`), lo que permite desplegarlo directamente en cualquier subdirectorio o plataforma estática (GitHub Pages, Vercel, Netlify, Cloudflare Pages).

### Opción A: Despliegue con GitHub Actions (Recomendada)

Crea un archivo `.github/workflows/deploy.yml` con el siguiente contenido:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: 'pages'
  cancel-in-progress: true

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

Luego, en GitHub:
1. Ve a **Settings** > **Pages**.
2. En **Build and deployment > Source**, selecciona **GitHub Actions**.
3. Haz push a `main` y el sitio se publicará automáticamente.

---

## 🏛️ Arquitectura del Proyecto

```
src/
├── components/          # Componentes modulares de interfaz
│   ├── layout/          # Cabecera, barra de acciones y pestañas
│   ├── modals/          # Diálogos (Mermaid, plantillas, atajos, temas)
│   ├── ui/              # Badges, alertas y toasts
│   └── usecase/         # Tablas, campos y filas de especificación
├── constants/           # Datos por defecto, paletas y plantillas
├── hooks/               # Lógica reactiva desacoplada (useTheme, useTabsManager, useToast)
├── services/            # Servicios de dominio independientes
│   ├── export/          # PDF multi-página, capturas PNG y almacenamiento JSON
│   └── mermaid/         # Generadores de sintaxis, clasificación NLP y renderizado SVG
└── types/               # Definiciones TypeScript de dominio estricto
```

---

## 📄 Licencia

MIT
