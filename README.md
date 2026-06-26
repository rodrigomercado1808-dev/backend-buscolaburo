# Busco Laburo - Backend API

Backend profesional desarrollado con Node.js y Express para la plataforma Busco Laburo. Este servicio centraliza la lógica de negocio, la integración con Mercado Pago y la administración avanzada mediante el SDK de Firebase Admin.

## 🚀 Tecnologías

- **Node.js & Express:** Framework de servidor.
- **Firebase Admin SDK:** Gestión de Firestore, Auth y Storage desde el servidor.
- **Mercado Pago SDK:** Integración de pagos y suscripciones.
- **node-cron:** Tareas programadas para expiración de suscripciones.
- **Seguridad:** Helmet, CORS, Express Rate Limit.
- **Validación:** Express Validator.

## 📁 Estructura del Proyecto

```text
src/
├── config/         # Configuraciones (Firebase, Mercado Pago)
├── constants/      # Constantes globales (Planes, Roles)
├── controllers/    # Lógica de los endpoints
├── middleware/     # Middlewares (Auth, Validaciones, Seguridad)
├── routes/         # Definición de rutas API
├── services/       # Lógica de negocio reutilizable
└── server.js       # Punto de entrada y Cron Jobs
```

## ⚙️ Configuración

1. Clonar el repositorio.
2. Instalar dependencias: `npm install`.
3. Crear un archivo `.env` basado en `.env.example`.
4. Obtener las credenciales de Firebase (Service Account JSON) y completar las variables de entorno.
5. Configurar el Access Token de Mercado Pago.

## 🛠️ Comandos

- `npm run dev`: Inicia el servidor en modo desarrollo con nodemon.
- `npm start`: Inicia el servidor en modo producción.

## 🔒 Seguridad y Autenticación

La API utiliza el **Firebase ID Token** enviado desde el frontend en el header `Authorization: Bearer <TOKEN>`. El backend valida este token usando `firebase-admin` para identificar al usuario y proteger los endpoints.

## 💳 Mercado Pago Webhook

Configura la URL de tu backend en el panel de Mercado Pago:
`https://tu-dominio.com/api/payments/webhook`
