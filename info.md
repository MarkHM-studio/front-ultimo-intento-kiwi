# 🧠 Documentación técnica - Frontend

## ⚙️ Stack utilizado

- React 19
- Vite
- TypeScript
- Tailwind CSS (con shadcn/ui)
- Zustand (estado global)
- Axios (cliente HTTP)
- React Hook Form + Zod

---

## 📦 Componentes UI

El proyecto utiliza una librería basada en Radix UI con componentes reutilizables como:

- Button, Input, Dialog, Table
- Tooltip, Tabs, Dropdown
- Sidebar, Navigation Menu

---

## 📂 Estructura relevante

- `src/components/` → Componentes reutilizables
- `src/pages/` → Vistas por rol
- `src/services/` → Comunicación con backend
- `src/stores/` → Estado global (Zustand)
- `src/hooks/` → Hooks personalizados
- `src/types/` → Tipado global

---

## 🔗 Integración con backend

- Uso de Axios con interceptores
- Manejo de JWT desde sessionStorage
- Soporte para entorno con ngrok

---

## 📌 Notas

- El frontend depende del backend activo
- Manejo de roles desde el login

---

## 📄 Información adicional

Using Node.js 20, Tailwind CSS v3.4.19, and Vite v7.2.4

Tailwind CSS has been set up with the shadcn theme

Setup complete: /mnt/okcomputer/output/app

Components (40+):
  accordion, alert-dialog, alert, aspect-ratio, avatar, badge, breadcrumb,
  button-group, button, calendar, card, carousel, chart, checkbox, collapsible,
  command, context-menu, dialog, drawer, dropdown-menu, empty, field, form,
  hover-card, input-group, input-otp, input, item, kbd, label, menubar,
  navigation-menu, pagination, popover, progress, radio-group, resizable,
  scroll-area, select, separator, sheet, sidebar, skeleton, slider, sonner,
  spinner, switch, table, tabs, textarea, toggle-group, toggle, tooltip

Usage:
  import { Button } from '@/components/ui/button'
  import { Card, CardHeader, CardTitle } from '@/components/ui/card'

Structure:
  src/sections/        Page sections
  src/hooks/           Custom hooks
  src/types/           Type definitions
  src/App.css          Styles specific to the Webapp
  src/App.tsx          Root React component
  src/index.css        Global styles
  src/main.tsx         Entry point for rendering the Webapp
  index.html           Entry point for the Webapp
  tailwind.config.js   Configures Tailwind's theme, plugins, etc.
  vite.config.ts       Main build and dev server settings for Vite
  postcss.config.js    Config file for CSS post-processing tools