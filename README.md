# Tienda Funavid - Backend API

Backend API para tienda online construido con NestJS, Prisma ORM y MySQL.

## Descripción

Sistema de tienda online donde:
- El **administrador** puede gestionar productos (CRUD completo) mediante autenticación JWT
- El **cliente** puede realizar compras sin cuenta, proporcionando solo datos de envío
- Los productos tienen categorías e imágenes almacenadas en Cloudinary
- La tienda tiene un QR único de pago para todos los productos
- El cliente sube comprobante de pago para validar su pedido
- **Todos los precios están en Pesos Colombianos (COP)**

## Requisitos

- Node.js 18+
- MySQL 8+
- pnpm (o npm)

## Instalación

```bash
# Instalar dependencias
pnpm install

# Configurar base de datos MySQL y ajustar .env
# Luego ejecutar migraciones
npx prisma migrate dev

# Generar cliente Prisma
npx prisma generate

# Crear datos de prueba (incluye admin)
npx tsx prisma/seed.ts
```

## Configuración

Crear archivo `.env` en la raíz:

```env
DATABASE_URL="mysql://user:password@localhost:3306/tiendafunavid"
PORT=3000
JWT_SECRET="your_secret_key_here"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"
```

## Ejecutar

```bash
# Desarrollo
pnpm run start:dev

# Producción
pnpm run build
pnpm run start:prod
```

## Estructura del Proyecto

```
src/
├── main.ts                    # Punto de entrada
├── app.module.ts              # Módulo principal
├── prisma/                    # Servicio Prisma (conexión DB)
│   ├── prisma.service.ts
│   └── prisma.module.ts
├── auth/                      # Módulo de autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── jwt.strategy.ts
│   ├── jwt-auth.guard.ts
│   └── dto/
│       └── login.dto.ts
├── products/                  # Módulo de productos
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── products.module.ts
│   └── dto/
│       └── product.dto.ts
├── categories/                # Módulo de categorías
│   ├── categories.controller.ts
│   ├── categories.service.ts
│   ├── categories.module.ts
│   └── dto/
│       └── category.dto.ts
├── customers/                 # Módulo de clientes
│   ├── customers.controller.ts
│   ├── customers.service.ts
│   ├── customers.module.ts
│   └── dto/
│       └── customer.dto.ts
├── orders/                    # Módulo de pedidos
│   ├── orders.controller.ts
│   ├── orders.service.ts
│   ├── orders.module.ts
│   └── dto/
│       └── create-order.dto.ts
├── cloudinary/                # Módulo de Cloudinary
│   ├── cloudinary.service.ts
│   └── cloudinary.module.ts
├── store-config/               # Módulo de configuración de tienda
│   ├── store-config.controller.ts
│   ├── store-config.service.ts
│   └── store-config.module.ts
└── uploads/                   # Módulo de uploads
    └── uploads.controller.ts
```

## Modelo de Datos

### Admin
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| email | String | Email único |
| password | String | Contraseña encriptada (bcrypt) |
| name | String | Nombre del admin |
| createdAt | DateTime | Fecha creación |

### StoreConfig
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| qrCodeUrl | String? | URL del QR general de pago |
| bankName | String? | Nombre del banco |
| accountName | String? | Nombre de la cuenta |
| accountNumber | String? | Número de cuenta bancaria |
| updatedAt | DateTime | Fecha última actualización |

### Category
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| name | String | Nombre único |
| createdAt | DateTime | Fecha creación |

### Product
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| name | String | Nombre del producto |
| description | String? | Descripción opcional |
| price | Decimal | Precio en COP (Pesos Colombianos) |
| imageUrl | String? | URL de imagen del producto (Cloudinary) |
| stock | Int | Cantidad disponible |
| categoryId | Int? | FK a Category |
| createdAt | DateTime | Fecha creación |
| updatedAt | DateTime | Fecha última actualización |

### Customer
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| name | String | Nombre completo |
| email | String | Correo electrónico |
| phone | String? | Teléfono opcional |
| address | String | Dirección de envío |
| city | String | Ciudad |
| postalCode | String? | Código postal |
| createdAt | DateTime | Fecha creación |

### Order
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| customerId | Int | FK a Customer |
| total | Decimal | Total del pedido |
| status | Enum | PENDING, PAID, SHIPPED, DELIVERED, CANCELLED |
| createdAt | DateTime | Fecha creación |
| updatedAt | DateTime | Fecha última actualización |
| paymentProof | PaymentProof? | Relación con comprobante de pago |

### OrderItem
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| orderId | Int | FK a Order |
| productId | Int | FK a Product |
| quantity | Int | Cantidad |
| price | Decimal | Precio unitario |

### PaymentProof
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| orderId | Int | FK a Order (único) |
| imageUrl | String | URL de la imagen del comprobante |
| uploadedAt | DateTime | Fecha de subida |

## API Endpoints

### Autenticación

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | /auth/login | Iniciar sesión como admin |

#### POST /auth/login - Ejemplo
```json
{
  "email": "admin@tiendafunavid.com",
  "password": "admin123"
}
```

#### Respuesta exitosa
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": 1,
    "email": "admin@tiendafunavid.com",
    "name": "Administrador"
  }
}
```

**Nota**: Para las rutas protegidas, incluir el token en el header:
```
Authorization: Bearer <access_token>
```

### Categorías

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /categories | No | Listar todas las categorías con productos |
| POST | /categories | Sí | Crear categoría (admin) |

#### POST /categories - Ejemplo
```json
{ "name": "Electrónica" }
```

### Productos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /products | No | Listar todos los productos |
| GET | /products/:id | No | Obtener producto por ID |
| POST | /products | Sí | Crear producto (datos JSON) |
| POST | /products/with-image | Sí | Crear producto con imagen |
| PUT | /products/:id | Sí | Actualizar producto (admin) |
| PUT | /products/:id/with-image | Sí | Actualizar producto con imagen |
| DELETE | /products/:id | Sí | Eliminar producto (admin) |
| POST | /products/upload-image | Sí | Subir imagen (standalone) |

#### POST /products/with-image - Ejemplo (multipart/form-data)
```
 name: "Camiseta"
 description: "Camiseta de algodón"
 price: 59000
 stock: 100
 categoryId: 1
 image: [archivo.jpg]
```

#### POST /products - Ejemplo (JSON)
```json
{
  "name": "Camiseta",
  "description": "Camiseta de algodón",
  "price": 59000,
  "imageUrl": "https://res.cloudinary.com/...",
  "stock": 100,
  "categoryId": 1
}
```

### Clientes

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /customers | Sí | Listar todos los clientes |
| GET | /customers/:id | Sí | Obtener cliente con pedidos |
| POST | /customers | No | Crear cliente |

### Pedidos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /orders | No | Listar todos los pedidos |
| GET | /orders/:id | No | Obtener pedido con detalles |
| POST | /orders | No | Crear pedido (checkout) |
| PATCH | /orders/:id/status | Sí | Actualizar estado (admin) |
| PATCH | /orders/:id/payment-proof | No | Subir comprobante de pago |
| DELETE | /orders/:id | Sí | Eliminar pedido (admin) |

#### POST /orders - Ejemplo
```json
{
  "customerName": "Juan Pérez",
  "customerEmail": "juan@email.com",
  "customerPhone": "+1234567890",
  "shippingAddress": "Calle Principal 123",
  "shippingCity": "Madrid",
  "shippingPostalCode": "28001",
  "items": [
    { "productId": 1, "quantity": 2 },
    { "productId": 3, "quantity": 1 }
  ]
}
```

#### PATCH /orders/:id/status - Ejemplo
```json
{ "status": "PAID" }
```

Estados válidos: `PENDING`, `PAID`, `SHIPPED`, `DELIVERED`, `CANCELLED`

### Configuración de la Tienda

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /store-config | No | Obtener toda la configuración |
| PATCH | /store-config | Sí | Actualizar datos bancarios |
| PATCH | /store-config/qr | Sí | Subir QR de pago |

#### GET /store-config - Respuesta
```json
{
  "qrCodeUrl": "https://res.cloudinary.com/...",
  "bankName": "Banco de Bogotá",
  "accountName": "Tienda Funavid",
  "accountNumber": "1234567890"
}
```

#### PATCH /store-config - Ejemplo
```json
{
  "bankName": "Banco de Bogotá",
  "accountName": "Tienda Funavid",
  "accountNumber": "1234567890"
}
```

El cliente consulta la configuración para ver los datos de pago y el QR.

### Upload de Imágenes (Cloudinary)

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| POST | /products/upload-image | Sí | Subir imagen de producto |
| POST | /uploads/payment-proof | Sí | Subir comprobante de pago |

Las imágenes se suben a Cloudinary y se retornan las URLs seguras.

#### Flujo de Pago

1. Cliente consulta los datos de pago → `GET /store-config`
2. Cliente realiza pedido → Estado `PENDING`
3. Cliente paga mediante transferencia y sube comprobante → `PATCH /orders/:id/payment-proof`
4. Admin verifica comprobante → `PATCH /orders/:id/status` → `PAID`

## Linting y Pruebas

```bash
# Linting
pnpm run lint

# Pruebas
pnpm run test
```

## Datos de Prueba

El script `prisma/seed.ts` crea:

- **1 Admin**: `admin@tiendafunavid.com` / `admin123`
- **4 Categorías**: Ropa, Calzado, Accesorios, Tecnología
- **8 Productos**: Con categorías e imágenes en Cloudinary
- **1 Cliente**: Juan Pérez
- **1 Pedido**: Orden de ejemplo con estado PENDING

## Notas

- La API valida datos de entrada con class-validator
- Los pedidos reducen automáticamente el stock de productos
- Clientes nuevos se crean automáticamente al hacer un pedido si el email no existe
- Las rutas POST, PUT, DELETE de productos requieren autenticación JWT
- El token JWT expira en 24 horas
- Todos los precios están en Pesos Colombianos (COP)
- Las imágenes se suben a Cloudinary (no se almacenan localmente)
- El QR de pago es único para toda la tienda (configurado por el admin)