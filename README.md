# Torres DLS

Catálogo de kits de Dream League Soccer.

## Nueva estructura

La página ahora está organizada así:

**Categoría → Equipo → Kits**

Ejemplo:

**América → Cruz Azul → Kit Local 2026 / Kit Visitante 2026 / Kit Portero 2026**

Los equipos ya no aparecen como si fueran directamente un kit.

## Cómo agregar una categoría

En `script.js`, busca:

```js
const categories = [
```

y agrega un objeto, por ejemplo:

```js
{ id: "África", name: "África", icon: "🌍" }
```

Después puedes asignar equipos a esa categoría usando:

```js
region: "África"
```

## Cómo agregar un equipo

Dentro de `const teams = [...]` agrega:

```js
{
  id: "chivas",
  name: "Chivas",
  country: "México",
  league: "Liga MX",
  region: "América",
  code: "CHI",
  description: "Club de fútbol mexicano."
}
```

El `id` debe ser único.

## Cómo agregar un kit

Dentro de `const kits = [...]` agrega:

```js
{
  id: "chivas-2026-local",
  teamId: "chivas",
  name: "Kit Local 2026",
  season: "2026",
  type: "Local",
  code: "CHI",
  url: "https://tu-url-real.com/kit"
}
```

El `teamId` debe coincidir exactamente con el `id` del equipo.

## Importante

Las URL que aparecen ahora (`example.com`) son de demostración. Deben sustituirse por las URL reales de tus kits.

## Cómo publicar los cambios en GitHub

1. Abre tu repositorio `TorresDLS/torres-dls`.
2. Abre `index.html` y reemplaza su contenido.
3. Abre `script.js` y reemplaza su contenido.
4. Abre `style.css` y reemplaza su contenido.
5. Guarda cada cambio con **Commit changes**.
6. Espera unos segundos/minutos a que GitHub Pages publique la nueva versión.

No necesitas crear carpetas para cada equipo: las páginas de equipo se generan automáticamente mediante JavaScript y el navegador usa una dirección como:

`#equipo/cruz-azul`
