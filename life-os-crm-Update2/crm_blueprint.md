# Custom CRM Architecture & Implementation Blueprint

## 1. System Overview & Core Capabilities

A modern, scalable Customer Relationship Management (CRM) system centers around 5 core operational domains:

1. **Entities & Relationships**: Accounts (Companies/Businesses) and Contacts (People).
2. **Sales Pipeline & Deals**: Stages, probability, forecasted value, and closing dates.
3. **Activity Timeline**: Notes, logged calls, emails, meetings, and system audit logs.
4. **Task & Follow-up Automation**: Scheduled reminders, follow-up queues, and deadlines.
5. **Custom Fields & Extensibility**: Dynamic attributes tailored to your specific business model.

---

## 2. Recommended Tech Stack

| Layer | Recommended Choice | Alternatives |
| :--- | :--- | :--- |
| **Frontend / App** | **Next.js (App Router) + React + Tailwind CSS** | React + Vite + shadcn/ui |
| **State & UI Lib** | **shadcn/ui + TanStack Table + @hello-pangea/dnd** (Kanban) | Lucide Icons, Radix UI |
| **Backend / API** | **Next.js Server Actions / Route Handlers** (or Fastify/Express) | FastAPI (Python), NestJS |
| **Database & ORM** | **PostgreSQL (Supabase/Neon) + Prisma ORM / Drizzle** | SQLite (Turso / Local) |
| **Auth & Security** | **NextAuth (Auth.js) / Clerk** | Supabase Auth, Lucia |
| **Hosting & Deploy** | **Vercel / Netlify / Docker VPS** | Fly.io, Railway |

---

## 3. Database Schema (Prisma Data Model)

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum DealStage {
  LEAD_IN
  CONTACT_MADE
  PROPOSAL_SENT
  NEGOTIATION
  CLOSED_WON
  CLOSED_LOST
}

enum ActivityType {
  NOTE
  CALL
  EMAIL
  MEETING
  TASK
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

model Account {
  id          String    @id @default(cuid())
  name        String
  website     String?
  industry    String?
  annualRevenue Float?
  phone       String?
  address     String?
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  contacts    Contact[]
  deals       Deal[]
  activities  Activity[]
}

model Contact {
  id          String    @id @default(cuid())
  accountId   String?
  account     Account?  @relation(fields: [accountId], references: [id], onDelete: SetNull)
  firstName   String
  lastName    String
  email       String?   @unique
  phone       String?
  title       String?
  isPrimary   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  deals       Deal[]
  activities  Activity[]
  tasks       Task[]
}

model Deal {
  id          String    @id @default(cuid())
  title       String
  value       Float     @default(0)
  currency    String    @default("USD")
  stage       DealStage @default(LEAD_IN)
  closeDate   DateTime?
  accountId   String?
  account     Account?  @relation(fields: [accountId], references: [id], onDelete: Cascade)
  contactId   String?
  contact     Contact?  @relation(fields: [contactId], references: [id], onDelete: SetNull)
  
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  activities  Activity[]
  tasks       Task[]
}

model Activity {
  id          String       @id @default(cuid())
  type        ActivityType
  title       String
  content     String?
  performedAt DateTime     @default(now())

  accountId   String?
  account     Account?     @relation(fields: [accountId], references: [id], onDelete: Cascade)
  contactId   String?
  contact     Contact?     @relation(fields: [contactId], references: [id], onDelete: Cascade)
  dealId      String?
  deal        Deal?        @relation(fields: [dealId], references: [id], onDelete: Cascade)

  createdAt   DateTime     @default(now())
}

model Task {
  id          String     @id @default(cuid())
  title       String
  dueDate     DateTime?
  status      TaskStatus @default(PENDING)
  priority    String     @default("MEDIUM") // LOW, MEDIUM, HIGH

  contactId   String?
  contact     Contact?   @relation(fields: [contactId], references: [id], onDelete: Cascade)
  dealId      String?
  deal        Deal?      @relation(fields: [dealId], references: [id], onDelete: Cascade)

  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt
}
```

---

## 4. Key UI & Functional Modules

### A. Deals Pipeline (Kanban Board)
- Visual column layout for each `DealStage` (`Lead In`, `Contact Made`, `Proposal Sent`, `Negotiation`, `Closed Won`, `Closed Lost`).
- Drag-and-drop card movement that updates `stage` in real-time.
- Summary metrics at the top of each column (total deal count, aggregate pipeline value).

### B. Contact & Account 360 View
- Profile card with contact details, company association, and primary status.
- Chronological activity timeline combining notes, call logs, emails, and linked deal updates.
- Quick action buttons: "Log Call", "Add Note", "Create Task", "Link Deal".

### C. Task & Reminder Center
- Filterable task list (Overdue, Due Today, Upcoming).
- Quick check-off toggle with auto-created activity record upon completion.

---

## 5. Phased Implementation Roadmap

1. **Phase 1: Project Setup & Database Layer**
   - Initialize Next.js project with Tailwind CSS & shadcn/ui.
   - Configure Prisma schema and deploy PostgreSQL instance (or local SQLite for dev).
   - Generate seeds with sample contacts, accounts, and deals.

2. **Phase 2: Core CRUD APIs & Contact Management**
   - Build server actions/endpoints for Accounts and Contacts.
   - Implement searchable data tables with sorting and filtering.

3. **Phase 3: Visual Pipeline (Kanban)**
   - Build the Deal creation modal and Kanban drag-and-drop interface.
   - Connect stage changes to optimistic UI updates.

4. **Phase 4: Activity Stream & Interaction Logging**
   - Build the 360° timeline component for detail pages.
   - Enable quick note/call logging and task scheduling.

5. **Phase 5: Integrations & Automation**
   - Email logging via webhooks / IMAP / Gmail API.
   - Data import/export (CSV, JSON).
