# Backend - API de Gestión de Tareas

Este es el backend de la aplicación de gestión de tareas, construido con **FastAPI** y **SQLAlchemy Async**. Provee endpoints para autenticación, manejo de usuarios y tareas.

## 🚀 Requisitos

- Python 3.11+
- PostgreSQL (o tu motor de base de datos preferido)
- `pip` o `poetry`

## 📦 Instalación

### Instalación Rápida

\`\`\`bash
# Clonar el repositorio
git clone https://github.com/JuanPMurdolo/lemon_code_challenge.git
cd backend-task-api

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # en Linux/Mac
venv\Scripts\activate     # en Windows

# Instalar dependencias
pip install -r requirements.txt

# Iniciar servidor de desarrollo
uvicorn main:app --reload
\`\`\`

La API estará disponible en: `http://127.0.0.1:8000`

### Configuración de Base de Datos

1. **Crear archivo de configuración**:
\`\`\`bash
cp .env.example .env
\`\`\`

2. **Configurar variables de entorno** en `.env`:
\`\`\`env
# Configuración de Base de Datos
DATABASE_URL=postgresql://usuario:contraseña@localhost/task_management
DATABASE_URL_TEST=postgresql://usuario:contraseña@localhost/task_management_test

# Configuración JWT
SECRET_KEY=tu_clave_secreta_super_segura
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Configuración del Servidor
HOST=0.0.0.0
PORT=8000
DEBUG=True
\`\`\`

3. **Ejecutar migraciones**:
\`\`\`bash
# Crear las tablas
python -c "from app.database import create_tables; create_tables()"

# O usar Alembic si está configurado
alembic upgrade head
\`\`\`

## 🧪 Endpoints Principales

### Autenticación
- `POST /auth/login` - Login con JWT
- `POST /auth/register` - Registro de nuevos usuarios
- `POST /auth/refresh` - Renovar token de acceso

### Usuarios
- `GET /users/getall` - Obtener todos los usuarios
- `GET /users/me` - Obtener información del usuario actual
- `PUT /users/{user_id}` - Actualizar información de usuario
- `DELETE /users/{user_id}` - Eliminar usuario

### Tareas
- `POST /tasks/` - Crear nueva tarea
- `GET /tasks` - Listar tareas (con filtros opcionales)
- `GET /tasks/{task_id}` - Obtener tarea específica
- `PUT /tasks/{task_id}` - Actualizar tarea completa
- `PUT /tasks/{task_id}/status` - Cambiar estado rápidamente
- `DELETE /tasks/{task_id}` - Eliminar tarea

### Documentación
- **Swagger UI**: `http://127.0.0.1:8000/docs`
- **ReDoc**: `http://127.0.0.1:8000/redoc`
- **OpenAPI JSON**: `http://127.0.0.1:8000/openapi.json`

## 📁 Estructura del Proyecto

\`\`\`
backend/
├── app/
│   ├── main.py  
│   ├── core/              
│   │   ├── __init__.py
│   │   ├── database.py     # Configuración de base de datos
│   │   └──auth.py
│   ├── dependencies/    #Genera la conexion entre la instancia de servicio y la de repositorio
│   │   ├── auth.py
│   │   └── task.py
│   ├── models/              # Modelos SQLAlchemy
│   │   ├── __init__.py
│   │   ├── base.py
│   │   ├── comments.py
│   │   ├── auth.py
│   │   └── task.py
│   ├── routers/             # Rutas de la API
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── tasks.py
│   ├── schemas/             # Esquemas Pydantic
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   └── task.py
│   ├── repositories/        # Capa de acceso a datos
│   │   ├── __init__.py
│   │   ├── auth.py
│   │   ├── task.py
│   │   └── interface/
│   │   │   ├──auth.py       #Interface abstracta de auth
│   │   │   └──task.py       #Interface abstracta de task
│   ├── services/            # Lógica de negocio
│       ├── __init__.py
│       ├── auth_service.py
│       └── task_service.py
├── tests/                   # Pruebas
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_users.py
│   └── test_tasks.py
├── requirements.txt         # Dependencias Python
├── tasks.db                # Base de datos SQLite (desarrollo)
├── test.db                 # Base de datos de pruebas
├── .env                    # Variables de entorno
├── Dockerfile              # Imagen Docker
└── README.md               # Este archivo
\`\`\`

## 🧪 Pruebas

### Ejecutar Pruebas

\`\`\`bash
# Instalar dependencias de desarrollo
pip install -r requirements-dev.txt

# Ejecutar todas las pruebas
pytest

# Ejecutar pruebas con cobertura
pytest --cov=app --cov-report=html

# Ejecutar pruebas específicas
pytest tests/test_auth.py

# Ejecutar pruebas en modo verbose
pytest -v
\`\`\`

### Tipos de Pruebas

- **Pruebas Unitarias**: Prueban funciones y métodos individuales

## 🔧 Desarrollo

### Comandos Útiles

\`\`\`bash
# Iniciar servidor de desarrollo con recarga automática
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Generar nueva migración
alembic revision --autogenerate -m "Descripción del cambio"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1
\`\`\`

## 🐳 Docker

### Desarrollo con Docker

\`\`\`bash
# Construir imagen
docker build -t task-api .

# Ejecutar contenedor
docker run -p 8000:8000 task-api

## 📊 Monitoreo y Logging

### Logs

Los logs se configuran automáticamente y incluyen:
- Requests HTTP entrantes
- Errores de aplicación
- Operaciones de base de datos
- Autenticación y autorización

## 🔒 Seguridad

### Características de Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Hashing de Contraseñas**: bcrypt para almacenamiento seguro
- **CORS**: Configurado para frontend específico
- **Rate Limiting**: Protección contra ataques de fuerza bruta
- **Validación de Entrada**: Pydantic para validación de datos

### Mejores Prácticas Implementadas

- Variables de entorno para configuración sensible
- Separación de responsabilidades (Repository Pattern)
- Validación exhaustiva de entrada
- Manejo centralizado de errores
- Logging de seguridad

## 🚀 Despliegue

### Producción

\`\`\`bash
# Instalar dependencias de producción
pip install -r requirements.txt

# Ejecutar con Gunicorn
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker

# O usar el script de inicio
./start.sh
\`\`\`

### Variables de Entorno de Producción

\`\`\`env
DATABASE_URL=postgresql://user:pass@host:port/dbname
SECRET_KEY=your-super-secret-production-key
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
\`\`\`

### Estándares de Código

- Seguir PEP 8 para estilo de código Python
- Usar type hints en todas las funciones
- Documentar funciones complejas con docstrings
- Mantener cobertura de pruebas >80%

## 📝 Changelog

### v1.0.0 (2024-01-01)
- ✅ Implementación inicial de la API
- ✅ Sistema de autenticación JWT
- ✅ CRUD completo para tareas y usuarios
- ✅ Documentación Swagger/ReDoc

## 🐛 Solución de Problemas

### Problemas Comunes

**Error de conexión a base de datos:**
\`\`\`bash
# Verificar que PostgreSQL esté ejecutándose
sudo systemctl status postgresql

# Verificar configuración en .env
cat .env | grep DATABASE_URL
\`\`\`

**Error de dependencias:**
\`\`\`bash
# Reinstalar dependencias
pip install --upgrade -r requirements.txt

# Limpiar cache de pip
pip cache purge
\`\`\`

**Problemas con migraciones:**
\`\`\`bash
# Resetear migraciones (¡CUIDADO en producción!)
alembic stamp head
alembic revision --autogenerate -m "Reset"
\`\`\`

## 📚 Recursos Adicionales

- [Documentación de FastAPI](https://fastapi.tiangolo.com/)
- [SQLAlchemy Async](https://docs.sqlalchemy.org/en/14/orm/extensions/asyncio.html)
- [Pydantic](https://pydantic-docs.helpmanual.io/)
- [Alembic](https://alembic.sqlalchemy.org/)

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

**Desarrollado con ❤️ usando FastAPI y Python**
