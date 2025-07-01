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

- `make dev` - Iniciar servidor de desarrollo - El que se recomienda usar para la prueba 
- `make build` - Construir para producción
- `make start` - Iniciar servidor de producción
- `make dev-setup` - Configuración completa del entorno de desarrollo

### Pruebas

- `make test` - Ejecutar todas las pruebas
- `make test-watch` - Ejecutar pruebas en modo observación
- `make test-coverage` - Ejecutar pruebas con reporte de cobertura
- `make test-unit` - Ejecutar solo pruebas unitarias
- `make test-integration` - Ejecutar solo pruebas de integración

## Estructura del Proyecto
```
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
```

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

# Configuración de API
NEXT_PUBLIC_API_URL=http://localhost:8000

## Despliegue

### Docker (Opcional)

\`\`\`bash
make docker-build
make docker-run
\`\`\`

## Tecnologías Utilizadas

- **Next.js 14+** - Framework de React para aplicaciones web
- **TypeScript** - Superset tipado de JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **React Testing Library** - Utilidades de prueba para React
- **Jest** - Framework de pruebas JavaScript