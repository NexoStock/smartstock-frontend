# SmartStock · Frontend (Desarrollo de Aplicaciones Open Source (1ASI0729))

Base del frontend de SmartStock. Stack: Angular, TypeScript, Signals, HttpClient, ngx-translate, Angular Material (Material 3).
Este proyecto es el **paso 1 (Base)** del documento *Estructura base del frontend de SmartStock*: layout, menú por tipo de negocio, rutas, tema, entorno, idioma y clases base. Las pantallas de cada contexto están como vistas vacías listas para reemplazar.

## Cómo correrlo

```bash
npm install
npm run server   # json-server en http://localhost:3000 (terminal 1)
npm start        # app en http://localhost:4200 (terminal 2)
```

En la pantalla Sign in hay dos botones **temporales** (Enter as Minimarket / Enter as Bodega) para probar cada menú. Se quitan en el paso de IAM.

Datos simulados: `server/db.json` (colecciones en español, como las rutas del backend). `json-server` solo sirve datos; las reglas de negocio (descontar stock, rechazar una venta) se prueban con el backend real.

## Estructura

```
src/
  iam/  catalog/  devices/  inventory/  alerts/  analytics/
    domain/model/ · application/ (store) · infrastructure/ (api, assemblers) · presentation/ (views, routes)
  shared/
    domain/model/ (BaseEntity, Money) · infrastructure/ (BaseApi, BaseEndpoint, BaseAssembler)
    presentation/components/ (layout, auth-layout, language-switcher, money, status-tag,
                              stock-level-badge, empty-state, date-range-filter, form-field)
    config/ (menu por tipo de negocio)
  i18n / locales  (en = en_US por defecto, es = es_419)
```

Vista de referencia: **catalog / Products** (`product-list`) ya usa store, API, assembler y componentes compartidos. Copien ese patrón.

## Reglas para evitar conflictos de commits

1. Cada contexto tiene su carpeta, su archivo de rutas, su store y sus claves de idioma. Solo se comparte `shared`, el menú y el entorno (`src/environments/environment.ts` y `environment.development.ts`): **avisen antes de tocarlos**.
2. Rama por contexto: `feature/<contexto>` (por ejemplo `feature/inventory`) desde `develop`, y pull request hacia `develop`. Nada de push directo a `main` ni `develop`.
3. Conventional Commits: `feat(inventory): add sale form`, `fix(catalog): validate unit weight`.
4. Las vistas no llaman a la API: hablan con el store de su contexto.
5. Nombres de archivos, clases y variables en inglés, siguiendo la guía de estilo del framework.
6. Ningún texto va escrito en la vista: todo sale de los archivos de idioma, con claves por contexto (`iam.`, `catalog.`, `devices.`, `inventory.`, `alerts.`, `analytics.`).
7. Los colores salen del tema (shared); ninguna vista pone colores propios.

## Una pantalla está terminada cuando
- tiene estados de carga, vacío y error,
- todos sus textos están en inglés y español,
- los montos usan `Money` (`S/ 1,234.50`, siempre en PEN),
- tiene etiquetas ARIA (campos con label, errores con `aria-invalid` y `aria-describedby`, botones de solo ícono con `aria-label`),
- se ve bien en celular, tablet y escritorio.

## Rutas (23 de las 32 User Stories: US01 a US15 y US25 a US32)

| Ruta | Pantalla | Historias | Mockups | Contexto |
|---|---|---|---|---|
| `/sign-in` | Sign in | US02 | M20, M21 | iam (pública) |
| `/sign-up` | Create account | US01 | M22, M23, M24 | iam (pública) |
| `/forgot-password` | Recover your password | US03 | M25, M26 | iam (pública) |
| `/dashboard` | Dashboard | US15 | M17 | analytics |
| `/reports` | Reports | US25 | M18 | analytics (solo minimarket) |
| `/products` | Products | US08 | M27 | catalog |
| `/products/new` | New product | US13 | M29, M30 | catalog |
| `/products/:id` | Product details | US07 | M28 | catalog |
| `/products/:id/edit` | Edit product | US14 | M19 | catalog |
| `/sensors` | Sensors | US06, US07 | M31 | devices |
| `/sensors/link` | Link sensor | US04 | M32, M33 | devices |
| `/sensors/:id/threshold` | Minimum threshold | US05 | M34, M35 | devices |
| `/comparison` | Comparison | US11, US12 | M39 | inventory (solo minimarket) |
| `/sales` | Sales | US27 | M9, M10 | inventory |
| `/sales/new` | New sale | US26 | M11, M12, M13 | inventory |
| `/sales/:id` | Sale details | US28 | M14 | inventory |
| `/purchases` | Purchases | US31 | M1, M2 | inventory |
| `/purchases/suppliers` | Suppliers | US29 | M7, M7A, M8, M7B | inventory |
| `/purchases/new` | New purchase | US30, US32 | M3, M4, M16 | inventory |
| `/purchases/:id` | Purchase details | US30 | M5, M6, M5A, M6A | inventory |
| `/alerts` | Alerts | US12, US32 | M15, M15A, M38 | alerts |
| `/settings` | Notification settings | US09, US10 | M36, M37 | alerts |

En bodega, `/comparison` y `/reports` redirigen a `/dashboard`. El Dashboard se llama Home en bodega.

## Despliegue
`.env.production` (o `environment.ts`) trae la URL del backend como `CHANGE-ME`. Cámbiala por la URL pública del backend antes de publicar, y el servidor debe redirigir todas las rutas a `index.html`.
