#!/bin/bash

#Hacerlo ejecutable:
# chmod +x backend/init-db.sh

echo "Esperando a la base de datos..."
sleep 5  # Espera para asegurarse que PostgreSQL ya esté arriba

echo "Inicializando la base de datos..."
python -c "
import asyncio
from app.core.database import init_db, AsyncSessionLocal
from app.models.user import User
from app.schemas.auth import UserCreate
from sqlalchemy import select
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

async def create_admin():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).where(User.username == 'admin'))
        existing = result.scalar_one_or_none()
        if not existing:
            hashed_password = pwd_context.hash('admin123')
            admin = User(
                username='admin',
                email='admin@example.com',
                full_name='Admin User',
                hashed_password=hashed_password,
                is_active=True,
                type='admin'
            )
            session.add(admin)
            await session.commit()
            print('✅ Usuario admin creado')
        else:
            print('ℹ️ El usuario admin ya existe')

async def main():
    await init_db()
    await create_admin()

asyncio.run(main())
"
