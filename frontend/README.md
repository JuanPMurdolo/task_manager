# Gestor de Tareas Frontend

Una aplicación moderna de gestión de tareas construida con Next.js, TypeScript y Tailwind CSS.

## Inicio Rápido

### Prerrequisitos

- Node.js 18+ 
- npm o yarn

### Configuración de Desarrollo

\`\`\`bash
# Instalar dependencias
make install

# Iniciar servidor de desarrollo
make dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

## Comandos Disponibles

### Desarrollo

- `make dev` - Iniciar servidor de desarrollo
- `make build` - Construir para producción
- `make start` - Iniciar servidor de producción
- `make dev-setup` - Configuración completa del entorno de desarrollo

### Pruebas

- `make test` - Ejecutar todas las pruebas
- `make test-watch` - Ejecutar pruebas en modo observación
- `make test-coverage` - Ejecutar pruebas con reporte de cobertura
- `make test-unit` - Ejecutar solo pruebas unitarias
- `make test-integration` - Ejecutar solo pruebas de integración
- `make test-ci` - Ejecutar pruebas para entorno CI

### Verificaciones de Calidad

- `make lint` - Ejecutar ESLint
- `make lint-fix` - Ejecutar ESLint con corrección automática
- `make type-check` - Ejecutar verificación de tipos TypeScript
- `make check` - Ejecutar todas las verificaciones de calidad (lint + type-check + test)

### Pruebas de Componentes Específicos

- `make test-login` - Probar formulario de login
- `make test-dashboard` - Probar dashboard
- `make test-task-list` - Probar lista de tareas
- `make test-user-management` - Probar gestión de usuarios

### Mantenimiento

- `make clean` - Limpiar artefactos de construcción
- `make fresh-install` - Instalación limpia de dependencias
- `make audit` - Ejecutar auditoría de seguridad
- `make deps-check` - Verificar dependencias desactualizadas

### Utilidades

- `make help` - Mostrar todos los comandos disponibles
- `make info` - Mostrar información del proyecto
- `make status` - Mostrar estado del proyecto

## Estructura del Proyecto

\`\`\`
├── app/                    # Directorio de la app Next.js
├── components/    
│   ├── auth/             # Login y registro
│   ├── tasks/            # Manejo de tareas
│   ├── users/            # Creacion y manejo de usuarios
│   ├── utils/            # Mensajes y formatos de error
│   └── ui/               # Componentes React
├── __tests__/            # Archivos de prueba
│   ├── components/       # Pruebas de componentes
│   ├── integration/      # Pruebas de integración
│── test-utils/       # Utilidades de prueba tuvieron que sacarse de la parte de test porque lo tomaba como un test mas
└── scripts/                  # Contiene un script para correr los tests
\`\`\`

## Pruebas

El proyecto utiliza Jest y React Testing Library para las pruebas:

- **Pruebas Unitarias**: Prueban componentes individuales de forma aislada
- **Pruebas de Integración**: Prueban interacciones entre componentes y flujos de trabajo
- **Cobertura**: Objetivo de >80% de cobertura de pruebas

### Ejecutar Pruebas

\`\`\`bash
# Ejecutar todas las pruebas
make test

# Ejecutar pruebas en modo observación durante el desarrollo
make test-watch

# Ejecutar pruebas con reporte de cobertura
make test-coverage

# Ejecutar archivo de prueba específico
make test-specific FILE=__tests__/components/login-form.test.tsx
\`\`\`

## Flujo de Trabajo de Desarrollo

1. **Configuración**: `make dev-setup`
2. **Desarrollo**: `make dev`
3. **Pruebas**: `make test-watch` (en otra terminal)
4. **Verificación de Calidad**: `make check` (antes de hacer commit)
5. **Construcción**: `make build` (antes del despliegue)

## Calidad del Código

El proyecto garantiza la calidad del código a través de:

- **ESLint**: Linting de código y aplicación de estilo
- **TypeScript**: Seguridad de tipos y mejor experiencia de desarrollo
- **Prettier**: Formateo de código (vía ESLint)
- **Jest**: Pruebas exhaustivas

## Variables de Entorno

Crea un archivo `.env.local` para desarrollo local:

\`\`\`env
# Configuración de API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Otras variables de entorno...
\`\`\`

## Despliegue

### Construcción de Producción

\`\`\`bash
make build
make start
\`\`\`

### Docker (Opcional)

\`\`\`bash
make docker-build
make docker-run
\`\`\`

## Contribuir

1. Hacer fork del repositorio
2. Crear una rama de funcionalidad
3. Realizar los cambios
4. Ejecutar verificaciones de calidad: `make check`
5. Enviar un pull request

## Solución de Problemas

### Problemas Comunes

**Las dependencias no se instalan:**

\`\`\`bash
make clean
make fresh-install
\`\`\`

**Las pruebas fallan:**

\`\`\`bash
make clean-cache
make test
\`\`\`

**Errores de construcción:**

\`\`\`bash
make type-check
make lint
\`\`\`

### Obtener Ayuda

- Ejecuta `make help` para ver todos los comandos disponibles
- Ejecuta `make status` para verificar la salud del proyecto
- Ejecuta `make info` para ver información del entorno

## Tecnologías Utilizadas

- **Next.js 14+** - Framework de React para aplicaciones web
- **TypeScript** - Superset tipado de JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **React Testing Library** - Utilidades de prueba para React
- **Jest** - Framework de pruebas JavaScript
- **ESLint** - Herramienta de linting para JavaScript/TypeScript
