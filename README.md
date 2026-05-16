# KobiPro v2

Multi-sector SaaS platform for small businesses. Built with Next.js 15, Prisma, and Turborepo.

## CleanFix Module

Cleaning business management platform — the first sector module.

### Live Demo

- **URL**: https://kobipro-v2-cleanfix.vercel.app
- **Demo Login**: No real auth required — select role and enter

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Monorepo | Turborepo |
| Database | PostgreSQL + Prisma ORM |
| UI | Tailwind CSS + shadcn/ui |
| Forms | React Hook Form + Zod |
| Auth | Demo cookie-based (7-day session) |

### Modules

- **Services** — CRUD for cleaning services
- **Bookings** — Appointment scheduling with status workflow
- **Customers** — Client management
- **Staff** — Team member tracking
- **Invoices** — Billing (placeholder)
- **Reports** — Analytics (placeholder)
- **Settings** — Business configuration

### Demo Auth

Login page lets you pick a role:
- **Admin** — Full access
- **Manager** — Most features
- **Customer** — Limited view

Demo session stored in `demo_login` cookie (7 days).

### Local Development

```bash
# Install dependencies
npm install

# Database setup
cd packages/db
npx prisma migrate dev
npx prisma db seed

# Run dev server
cd apps/cleanfix
npm run dev
```

### Project Structure

```
kobipro-v2/
├── apps/
│   └── cleanfix/        # Next.js app
├── packages/
│   ├── db/              # Prisma schema + client
│   ├── ui/              # shadcn/ui components
│   └── shared/          # Utils + types
├── turbo.json           # Pipeline config
└── package.json
```

### Roadmap

- [x] CleanFix (Cleaning)
- [ ] BuildPro (Construction)
- [ ] BarberPro (Barbershop)
- [ ] CarPro (Auto detailing)
- [ ] RestoPro (Restaurant)
- [ ] ElectroPro (Electrical)
- [ ] WoodPro (Carpentry)
- [ ] HomePro (Handyman)
- [ ] MediPro (Medical)

### License

MIT — Built by Dante (Deuterium12{MCK})
