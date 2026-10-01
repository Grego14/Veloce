# 🚀 Veloce – e-commerce demo

## 🛠️ Tech Stack

* **Framework & Routing:** [Astro](https://astro.build/) (v7)
* **UI & Islands:** [Preact](https://preactjs.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) (v4) & `clsx` / `tailwind-merge`
* **State Management:** [Nano Stores](https://github.com/nanostores/nanostores)
* **Backend & Auth:** [Firebase](https://firebase.google.com/) (Authentication & Firestore)
* **Animations:** [GSAP](https://gsap.com/)
* **Icons:** [Lucide Preact](https://lucide.dev/)

---

## 🏛️ Architecture

```text
[ BACKEND & INFRASTRUCTURE ]
  ├── Firebase
  │     ├── Firebase Auth       ---> User authentication
  │     └── Cloud Firestore     ---> Data persistence & security rules
  │
  └── Core Configuration
        ├── astro.config.mjs    ---> Astro / Preact / Tailwind integration
        └── content.config.ts   ---> Static content collections & JSON schema

--------------------------------------------------------------------------------

[ CLIENT STATE & LOGIC ] (src/stores & src/lib)
  ├── Nano Stores / Reactivity
  │     ├── authStore.ts        ---> Global user session state
  │     ├── cartStore.ts        ---> Global shopping cart state
  │     └── i18nStore.ts        ---> Active language/locale state
  │
  └── Services & Integrations
        ├── firebase.ts         ---> Firebase SDK initialization
        └── cartSync.ts         ---> Firestore to client cart synchronization

--------------------------------------------------------------------------------

[ INTERNATIONALIZATION & DATA ] (src/i18n & src/data)
  ├── i18n / Locales
  │     ├── locales/ (es.ts, en.ts) ---> Translation dictionaries
  │     ├── utils.ts            ---> Routing helpers & string utils
  │     └── types.ts            ---> I18n type definitions
  │
  └── Products (Data Layer)
        └── products/ (*.json)  ---> Static product catalog (vans, boots, etc.)

--------------------------------------------------------------------------------

[ VIEW LAYER & ROUTING ] (src/pages & src/views)
  ├── Pages / Routing (Astro File-based Routing)
  │     ├── / (Spanish Default) ---> index.astro, profile.astro, buy.astro, catalog/
  │     └── /en/ (English)      ---> en/index.astro, en/profile.astro, catalog/
  │
  └── Reusable Views (Layout View Pattern)
        └── views/              ---> Main route components
                                     (HomeView, CatalogView, ProductView, etc.)

--------------------------------------------------------------------------------

[ UI COMPONENTS ] (src/components)
  ├── Static / SSR Components (Astro)
  │     ├── AnnouncementsBar.astro
  │     ├── CartDrawer.astro
  │     ├── MenuDrawer.astro
  │     └── Products.astro
  │
  └── Interactive Islands / CSR (Preact / React TSX)
        ├── BuyPanel.tsx        ---> Checkout & payment handling
        ├── ProfilePanel.tsx    ---> Account management & history
        ├── CartDrawer.tsx      ---> Interactive cart drawer
        ├── AddToCart.tsx       ---> Cart action button
        └── icons/              ---> UI icon components

================================================================================
```

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                | Action                                           |
| :--------------------- | :----------------------------------------------- |
| `pnpm install`         | Installs dependencies                            |
| `pnpm dev`             | Starts local dev server at `localhost:4321`      |
| `pnpm build`           | Build your production site to `./dist/`          |
| `pnpm preview`         | Preview your build locally, before deploying     |
| `pnpm astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `pnpm astro -- --help` | Get help using the Astro CLI                     |
