# La U del Futuro — XXIV Convención de Egresados UTP

## Overview

The system is a single, owned identity surface for the XXIV Convención de
Egresados UTP under the slogan **"La U del futuro."** The brand speaks **from
the community UTP** — egresados, estudiantes, docentes, aliados y ciudad —
and casts **AI as a tool for academic, professional, and social change**, not
as the subject. The palette is anchored on **Azul Noche** (`{colors.azul-noche}`
— #0F1226), a deep near-black institutional blue that acts as the master
background; a quiet **Blanco Ártico** (`{colors.blanco}` — #F0F4F8) provides
the neutral base. Two signal accents — **Naranja** (`{colors.naranja}` —
#E14C1B) and **Magenta** (`{colors.magenta}` — #A01660) — carry activity
coding across the event.

The system's "voltage" is institutional **pertenencia** (belonging): a UTP
student, egresado, or citizen must recognize themselves in every piece. It
must express university belonging, a look toward the future, and technological
openness, without losing institutional closeness. Energy comes from the **logo
maestro en vertical** hero, the Good Times display voice, and sparse
high-impact color — never from decoration.

**Key Characteristics:**
- Deep navy canvas (`{colors.azul-noche}` — #0F1226) with ivory white type.
  The system inverts on light surfaces only through the approved light-background
  logo variant — there is no fully light page surface.
- Display headlines in **Good Times** — the branded title voice for main dates,
  impact calls, stage labels, and hero pieces.
- Body in **Montserrat Alternates** — subtitles, intros, labels, navigation,
  and priority information blocks.
- Two activity accents (`{colors.naranja}` / `{colors.magenta}`) coded by
  activity — never used as cement for neutral institutional content.
- Corners are **rectilinear** by default; radius is a choice, not the default.
- The slogan **"La U del futuro"** is the emotional, visual, and sonic close —
  always after the official event name, never as a replacement.

## Identity Pillars

The brand voice is built on three pillars that map to UI behavior:

- **Pertenencia** — the system speaks *from* the UTP community: egresados,
  estudiantes, docentes, aliados y ciudad. Institutional closeness is the floor.
- **Futuro aplicado** — AI appears as a transformation tool; surfaces signal a
  technological future without becoming "AI-themed" or cold.
- **Celebración útil** — the system must *serve* the event: agenda, escenario,
  piezas digitales, señalética y networking. Tooling beats decoration.

## Logo System

### Approved Versions

The **logo maestro vertical** is the priority signature for high-impact pieces:
portada, invitaciones, piezas hero, fondos de escenario, publicaciones de
lanzamiento y comunicaciones generales.

| Variant | Use |
|---|---|
| `{logo.vertical-dark}` | Vertical sobre fondo oscuro — default on Azul Noche |
| `{logo.vertical-light}` | Vertical sobre fondo claro — rare light contexts |
| `{logo.horizontal}` | Horizontal para encabezados — nav and headers |
| `{logo.lineal-positive}` | Lineal positiva — one-color cases |
| `{logo.lineal-negative}` | Lineal negativa — monochrome / light-on-dark |

### Protection Zone

The safe area is **2x**, where `x` equals the height of the word **FUTURO**
in the logotype. No graphic element, text, border, or allied brand may invade
this margin. Scale the lockup proportionally; never re-draw it.

### Logo Do's

- Use the vertical master as the primary signature.
- Keep the "Convención de Egresados UTP · XXIV" treatment intact.
- Preserve the 2x protection zone on all placements.

### Logo Don'ts (Usos Incorrectos)

- Don't deform or stretch the lockup.
- Don't recolor it outside approved variants.
- Don't add shadows.
- Don't enclose it in boxes.
- Don't place it under low contrast.
- Don't rotate it.
- Don't separate the symbol and text.
- Don't apply 3D/photo effects.

## Colors

### Brand & Surface

| Token | Value | Map | Use |
|---|---|---|---|
| `{colors.azul-noche}` | #0F1226 (61,55,0,85) | Fondo maestro | Master background, hero, footer, dark cards |
| `{colors.blanco}` | #F0F4F8 (2,0,0,4) | Base neutra | Primary type on dark, light background for cards-in-inverse |
| `{colors.azul}` | — | Institutional  | Supporting navy derivatives from the heritage scale |
| `{colors.naranja}` | #E14C1B (0,67,88,9) | Accent A | Networking, cultural, **fiesta, celebración, concierto** |
| `{colors.magenta}` | #A01660 (0,90,40,37) | Accent B | **Empleabilidad, emprendimiento** |

### Activity Coding

Color is a **semantic coding system**, not decoration. Each activity vertical
maps to one accent:

| Activity | Color |
|---|---|
| Networking, cultural, fiesta, celebración, concierto | `{colors.naranja}` |
| Empleabilidad, emprendimiento | `{colors.magenta}` |

### Text & Neutral

- **Ink on dark** — `{colors.blanco}` (#F0F4F8) for headlines and primary copy.
- **Body** — a cooled ivory-white derivative (~#C9D1DF) for running text.
- **Muted** — a desaturated blue-gray (~#8A94A8) for captions, footer, metadata.

## Typography

### Font Family

**Good Times** is the display/impact voice — titles, main dates, stage labels,
and hero pieces. **Montserrat Alternates** handles everything read — subtitles,
entradillas, labels, navigation, and priority information blocks.

### Hierarchy

| Token | Family | Size | Weight | case | Use |
|---|---|---|---|---|---|
| `{type.hero}` | Good Times | 64px | Bold | Mixed-case display | Hero head (logo + "La U del futuro") |
| `{type.display}` | Good Times | 40px | Bold | Mixed-case | Section titles, stage labels |
| `{type.title}` | Good Times | 28px | Bold | Mixed-case | Card titles, agenda blocks |
| `{type.subtitle}` | Montserrat Alternates | 20px | Medium | Sentence | Entradillas, intros |
| `{type.label}` | Montserrat Alternates | 14px | SemiBold | UPPERCASE spaced | Buttons, nav, tags |
| `{type.body}` | Montserrat Alternates | 16px | Regular | Sentence | Body text |
| `{type.body-sm}` | Montserrat Alternates | 14px | Regular | Sentence | Secondary text, dates |
| `{type.caption}` | Montserrat Alternates | 12px | Regular | Sentence | Captions, legal, fine print |

### Principles

- Good Times is the **branded** voice — use it only where the brand should
  shout (titles, dates, impact). Montserrat Alternates carries all reading.
- Uppercase letterspaced labels for controls; sentence-case elsewhere.
- Dates and venue info are brand moments — Good Times bold, larger than
  surrounding body.

## Layout

### Spacing & Grid

- Base unit 4px. Section rhythm uniform (~96px) between major bands.
- Max content width ~1440px, centered. Hero and escenario bands may bleed
  full-bledo.
- Card grids: 3-up desktop → 2-up tablet → 1-up mobile.
- Neutral space sits as **white space**, not atmospheric backdrops or gradients.

### Whitespace Philosophy

The brand trusts **pertenencia and clarity** over decoration. Copy sits in
aligned columns; empty space stays as pure Azul Noche canvas. No gradient
backdrops behind hero type — depth comes from the lockup and color accents,
not chrome.

## Shapes

### Radius

- Default straight corners (`{rounded.none}`). Rectilinear reads institutional
  and engineered.
- Small radii (`{rounded.sm}` ~6px) reserved for pills and small toggle/session
  chips on agenda surfaces.
- Full (`{rounded.full}`) only for circular icon/fab controls.

## Components

### Navigation

**`top-nav`** — Azul Noche bar, pinned, ivory brand lockup (horizontal variant)
left; menu (Agenda, Ponentes, Networking, Emprendimiento, Tienda/Tickets) right;
session chip coded by activity accent.

### Buttons

- **`button-primary`** — Azul Noche fill, Blanco text, straight corners. The
  default institutional action.
- **`button-accent`** — Naranja or Magenta fill depending on activity context.
  Reserved for activity-owned CTAs (concierto tickets, employability track).
- **`button-outline`** — 1px Blanco outline on transparent, straight corners.
  Used over hero/escenario surfaces.
- **`button-icon`** — circular `{rounded.full}`, aria-labeled, 48×48 tap target.

### Cards & Containers

- **`hero-band`** — Azul Noche, logo maestro vertical, Good Times headline,
  dates in Good Times bold. Vertically centered lockup; your submitted speakers,
  agenda CTA, and ticket CTA sit as outline + primary buttons.
- **`agenda-card`** — Status/category chip colored by activity accent, time in
  RawTime Good Times, session title, location. Straight corners, 1px hairline.
- **`speaker-card`** — Photo, name, role, tagline. Clean, institutional, no
  decorative treatment.
- **`information-card`** — Montserrat Alternates lead + body, neutral surface,
  used for general communication (never accent-coded cement).
- **`activity-card`** — Uses the owning accent for chip + key CTA; card edge
  stays neutral.

### Signal

- **`event-chip`** — color-coded by activity (`{colors.naranja}` /
  `{colors.magenta}`), uppercase label.
- **`qrcode-surface`** — ticket/digital piece; good contrast on Azul Noche,
  QR rendered in Blanco on Azul Noche for scanners.

## Applications Mapping

The manual's application set maps to screens:

| Brand application | UI surface |
|---|---|
| Agenda | Agenda section + session detail |
| Escenario | Hero / landing hero band |
| Piezas digitales | Marketing landing sections |
| Señalética | Navigation + wayfinding copy |
| Escarapelas | User badge / account header |
| Networking | Networking cards, accents in Naranja |
| Emprendimiento | Emprendimiento vertical, accents in Magenta |
| Slogan "La U del futuro" | Closing band, footer, invite/social closes |

## Slogan Usage

**"La U del futuro"** is the emotional, visual, and sonic close of the brand.

- **Use in:** portadas, cierres, invitaciones, videos, banners, cuñas
  radiales y menciones institucionales.
- **Never as:** a replacement for the official event name "XXIV Convención de
  Egresados UTP."
- **Rule:** official logo/name first; the slogan appears afterward as the
  final closing remate.

## Do's and Don'ts

### Do
- Anchor every page on Azul Noche; let Blanco articulate the type.
- Lead with the vertical logo maestro on high-impact surfaces.
- Keep the full official name before the slogan.
- Code activity by color (`{colors.naranja}` /
  `{colors.magenta}`) — color is meaning.
- Use Good Times only for brand shouting; Montserrat Alternates for reading.
- Prefer straight corners; reserve full radius for icon controls.
- Reserve the slogan for closings.

### Don't
- Don't introduce new brand colors outside the approved palette.
- Don't decorate institutional/neutral content with accent fills.
- Don't use "La U del futuro" in place of the official event name.
- Don't add gradients, shadows, or atmospheric backdrops behind type.
- Don't misuse the logo (deform, recolor, rotate, box, low-contrast, 3D).
- Don't crowd the 2x protection zone.

## Responsive Behavior

| Breakpoint | Key changes |
|---|---|
| Mobile < 768px | Hamburger nav; hero Good Times scales down; agenda 1-up; events stack |
| Tablet 768–1024px | Horizontal nav tightens; 2-up cards |
| Desktop ≥ 1024px | Full nav; 3-up cards; logo horizontal in nav, vertical in hero |

- Buttons and icon controls minimum 48×48 tap target.
- The slogan and official name always remain readable — no ugly wrapping of
  "Convención de Egresados UTP."

## Known Gaps

- Exact Good Times / Montserrat Alternates weights beyond the observed cuts are
  not captured from the manual; treat displayed weights as canonical.
- The `{colors.azul}` heritage scale and any tertiary neutrals are inferred from
  the master palette — confirm before extending token sets.
- Animation and transition timings are out of scope.
- Print applications (escarapelas, señalética) are brand guidance, not
  component specs; digital-only tokens defined here.