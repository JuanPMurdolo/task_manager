# lemon_code_challenge

# Decisiones Tecnicas

📐 Arquitectura 

El sistema sigue una arquitectura modular y desacoplada con separación clara de responsabilidades:

Frontend (React) 
      |
      | 
      ↓
Backend (FastAPI + SQLAlchemy Async)
      |
      ↓
Base de datos (SQLite/Postgres)

🧱 Backend

* Framework elegido: FastAPI por su excelente soporte para tipado, asincronismo, validaciones automáticas y documentación Swagger integrada.

* ORM: SQLAlchemy 2.x (async) para flexibilidad y control de bajo nivel sobre las consultas.

* Autenticación: Implementada con JWT. Con OAuth2PasswordBearer y passlib para el manejo seguro de contraseñas.

* Arquitectura desacoplada:
    * routers: definen los endpoints.
    * services: lógica de negocio (autenticación, tareas).
    * repositories: acceso a base de datos.
    * models: definición de tablas y relaciones.
    * schemas: validación y serialización con Pydantic.
    * core: configuración general, inicialización y utilidades.

* Principios SOLID aplicados:
    * Responsabilidad Única: Cada módulo hace una sola cosa (e.g., AuthRepository maneja solo lógica de auth).
    * Inversión de Dependencias: Se inyectan dependencias en Depends() y no se acoplan directamente los servicios a implementaciones.
    * Abierto/Cerrado: El código es extensible mediante nuevos repositorios o servicios sin modificar los existentes.

* Tests:
    * Unitarios y de integración con pytest, pytest-asyncio.
    * Separados por dominio: test_auth.py, test_task_repository.py, etc.
    * Tests con AsyncMock para aislar lógica de negocio de la capa de datos.

* Makefile incluido con comandos comunes (dev, test, lint, docker-build, etc.).

* Base de Datos:
    * Uso de SQLite (USE_SQLITE=true) para simplicidad local.
    * Soporte para PostgreSQL disponible con variable de entorno DATABASE_URL. testeado con Docker compose.

🧩 Frontend
* Framework: React con Vite (mejor experiencia de desarrollo). Se uso lemon.me como punto de partida para el diseño y el uso de colores, se uso vercel v0 para armar un modelo acorde a los estilos

* UI/UX:
    * Componentes reutilizables (TaskForm, TaskList, TaskFilters, etc.).
    * Formularios con validación.
    * Feedback al usuario (mensajes de error, loading).

* Autenticación:
    * Uso de fetch con token JWT en Authorization headers.
    * Almacenamiento del token en localStorage.

* Estado:
    * Uso de estado local con useState y useEffect.
    * Posibilidad de escalar a un gestor global si el proyecto crece.

* Diseño Responsive: Tailwind CSS para estilos rápidos y responsivos.

🐳 Docker y CI/CD

* Dockerfile para el backend (docker-build, docker-run). Y el front. Y docker compose para correr todo junto.

⚙️ Consideraciones Extra

* Se evitó usar librerías o SDKs que requieran logins o cuentas externas, cumpliendo el requisito de ejecución limpia en Linux/mac. Se testeo todo en Windows 11 y en Mac m2. [<Enlace al video>](https://youtu.be/qhGNco5wlAA)

* Se agregó un .env para configurar el uso de SQLite o PostgreSQL sin cambiar el código.

* Todas las instrucciones están en español y en formato Makefile para facilitar la vida al desarrollador.


