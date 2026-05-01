# Tienda Funavid - Backend API

Backend API para tienda online construido con NestJS, Prisma ORM y MySQL.

## Descripción

Sistema de tienda online donde:
- El **administrador** puede gestionar productos (CRUD completo) mediante autenticación JWT
- El **cliente** puede realizar compras sin cuenta, proporcionando solo datos de envío

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
├── customers/                 # Módulo de clientes
│   ├── customers.controller.ts
│   ├── customers.service.ts
│   ├── customers.module.ts
│   └── dto/
│       └── customer.dto.ts
└── orders/                    # Módulo de pedidos
    ├── orders.controller.ts
    ├── orders.service.ts
    ├── orders.module.ts
    └── dto/
        └── create-order.dto.ts
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

### Product
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| name | String | Nombre del producto |
| description | String? | Descripción opcional |
| price | Decimal | Precio (2 decimales) |
| imageUrl | String? | URL de imagen |
| stock | Int | Cantidad disponible |
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

### OrderItem
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | Int | ID único (auto) |
| orderId | Int | FK a Order |
| productId | Int | FK a Product |
| quantity | Int | Cantidad |
| price | Decimal | Precio unitario |

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

**Nota**: Para las rutas protegidas (POST, PUT, DELETE de productos), incluir el token en el header:
```
Authorization: Bearer <access_token>
```

### Productos

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | /products | No | Listar todos los productos |
| GET | /products/:id | No | Obtener producto por ID |
| POST | /products | Sí | Crear producto (admin) |
| PUT | /products/:id | Sí | Actualizar producto (admin) |
| DELETE | /products/:id | Sí | Eliminar producto (admin) |

#### POST /products - Ejemplo
```json
{
  "name": "Camiseta",
  "description": "Camiseta de algodón",
  "price": 29.99,
  "imageUrl": "https://example.com/camiseta.jpg",
  "stock": 100
}
```

### Clientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /customers | Listar todos los clientes |
| GET | /customers/:id | Obtener cliente con pedidos |
| POST | /customers | Crear cliente |

### Pedidos

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | /orders | Listar todos los pedidos |
| GET | /orders/:id | Obtener pedido con detalles |
| POST | /orders | Crear pedido (checkout) |
| PATCH | /orders/:id/status | Actualizar estado |

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
- **8 Productos**: Diversos items de ropa y accesorios
- **1 Cliente**: Juan Pérez
- **1 Pedido**: Orden de ejemplo con estado PAID

## Notas

- La API valida datos de entrada con class-validator
- Los pedidos reducen automáticamente el stock de productos
- Clientes nuevos se crean automáticamente al hacer un pedido si el email no existe
- Las rutas POST, PUT, DELETE de productos requieren autenticación JWT
- El token JWT expira en 24 horas