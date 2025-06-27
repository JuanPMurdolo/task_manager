# Backend - Task Management API

Este es el backend de la aplicación de gestión de tareas, construido con **FastAPI** y **SQLAlchemy Async**. Provee endpoints para autenticación, manejo de usuarios y tareas.

## 🚀 Requisitos

- Python 3.11+
- PostgreSQL (o tu motor de base de datos preferido)
- `pip` o `poetry`

## 📦 Instalación

1. Clona el repositorio:

```bash
git clone https://github.com/JuanPMurdolo/lemon_code_challenge.git
cd backend-task-api
python -m venv venv
source venv/bin/activate  # en Linux/Mac
venv\Scripts\activate     # en Windows

pip install -r requirements.txt

uvicorn main:app --reload
```

La API estará disponible en: http://127.0.0.1:8000

🧪 Endpoints principales
* POST /auth/login: Login con JWT
* GET /users/getall: Obtener todos los usuarios
* POST /tasks/: Crear tarea
* GET /tasks: Listar tareas
* PUT /tasks/{task_id}: Actualizar tarea
* PUT /tasks/{task_id}/status: Cambiar estado rápidamente
* DELETE /tasks/{task_id}: Eliminar tarea

swagger disponible aca http://127.0.0.1:8000/docs
