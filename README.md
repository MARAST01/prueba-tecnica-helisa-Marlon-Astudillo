# Catálogo de cuentas · Aravia

Módulo de catálogo de cuentas con API (NestJS) y pantalla (React + Vite). completado y sin errores. se hace validación con terminal y console.

## Cómo correrlo

```bash
npm install
npm run dev        # API en :3000, web en :5173
npm test           # pruebas de la API (Vitest)
```

## API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/accounts` | Catálogo como árbol anidado (`acceptsMovements` indica si es hoja) |
| POST | `/accounts` | Crea una cuenta: `{ code, name, nature? }` (`nature` solo para clases) |
| DELETE | `/accounts/:code` | Elimina una cuenta; 409 si tiene hijas |

Errores con forma estable: `{ statusCode, type, message, errors: [{ field?, message }] }`.
400 validación · 404 no existe · 409 código duplicado o cuenta con hijas · 422 padre inexistente.

## Decisiones

- **Clean architecture en el backend** (`api/src/accounts`): `domain` (entidad, value object `AccountCode`, errores de dominio y puerto `AccountRepository`), `application` (un caso de uso por operación), `infrastructure` (repositorio en memoria) y `presentation` (controller y filtro que traduce errores de dominio a HTTP). El dominio no importa nada de Nest ni de Express.
- **Repositorio en memoria con los datos del enunciado como semilla.** El enunciado no pide persistencia; cambiarla es implementar el puerto y cambiar un provider.
- **Sin dependencias nuevas.** La validación vive en el dominio, no en DTOs con decoradores.
- **La naturaleza** se pide solo al crear una clase y los descendientes la heredan (regla 8). La API calcula `acceptsMovements` (regla 6).
- **Frontend por feature** (`web/src/features/accounts`): capa de API tipada, hook de datos, validación en cliente que replica las reglas del dominio y componentes pequeños (`AccountTree`, `AccountForm`, `ConfirmDialog`). Sin librerías de UI ni de estado: el estado es local y el alcance no lo justifica.
- **Errores de la API junto al campo**: se mapean por `field`; los que no tienen campo salen como alerta del formulario. Al eliminar, el error (por ejemplo, cuenta con hijas) se muestra dentro del diálogo de confirmación.
- Accesibilidad básica: roles de árbol, `aria-expanded`, `aria-invalid`, `role="alert"` y `<dialog>` nativo.
- **Se implementa el buscador a partir de código y nombre** Permite realizar la busqueda de cuentas y tambien sus hijas si es que la tienen.

## Qué dejé afuera

- Persistencia real de la base de datos, autenticación, edición de cuentas y movimientos contables.
- Pruebas del frontend y e2e de la API.
- Navegación por teclado completa del árbol (flechas).

## Qué haría con más tiempo

- Base de datos en sql, puede ser con postgreSQL o SQLite, dependiendo la cantidad de movimiento a futuro.
- La opción de editar las cuentas.
- Rediseño visual y mensaje tooltip para apoyo a los usuarios novatos.
- Dockerizar el back, front y bd, con el fin que sea más ameno el trabajo en diferentes entornos de desarrollo y despliegue en infraestructura local o en la nube.
