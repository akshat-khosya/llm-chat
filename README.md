# Spur Live Chat Agent

A live chat application built with React, Node.js, and an LLM backend (OpenAI/Portkey).

## 🏃 How to Run Locally

### 1. Install Dependencies
Run this from the root directory to install packages for both client and server:
```bash
npm run install-all
```

### 2. Configure Environment Variables
Create a `.env` file in the `server/` directory:
```env
PORT=3000
DATABASE_URL=sqlite.db
OPENAI_API_KEY=               # Required: Your OpenAI Key
PORTKEY_API_KEY=            # Optional: For AI Gateway features
PORTKEY_VIRTUAL_KEY=            # Optional: For Virtual Key management
```

### 3. Setup Database
Initialize the SQLite database schema:
```bash
cd server
npm run db:push
cd ..
```
*This uses Drizzle Kit to push the schema to `server/sqlite.db`.*

### 4. Start Development Server
```bash
npm run dev
```
This concurrently runs:
- **Frontend** (Vite): `http://localhost:5173`
- **Backend** (Express): `http://localhost:3000`

---

## 🏗️ Architecture Overview

The project is structured as a monorepo with clean separation of concerns.

### Backend (`/server`)
- **Framework**: Express with TypeScript.
- **Layers**:
    - **Routes** (`src/routes/`): Handles HTTP requests and input validation (Zod).
    - **Services** (`src/services/`): Encapsulates business logic, specifically the LLM integration (`llm.ts`).
    - **Data Access** (`src/db/`): Uses **Drizzle ORM** with `better-sqlite3` for type-safe database interactions.
- **Static Serving**: In production, it serves the React frontend static assets to allow single-service deployment.

### Frontend (`/client`)
- **Framework**: React + Vite.
- **State Management**: Custom `useChat` hook handles message history, loading states, and API calls.
- **UI**: Tailwind CSS for styling, Lucide React for icons, and `emoji-picker-react`.
- **Optimization**: Lazy loading implemented for heavy components (Emoji Picker).

### 💡 Interesting Design Decisions
1. **Optimistic UI**: Messages are displayed immediately to the user before the server confirms, creating a snappy experience.
2. **Portkey AI Gateway**: Used as a middleware layer for the LLM. It provides:
    - **Caching**: Reduces latency and cost for repeated queries.
    - **Reliability**: Fallback logic is implemented (Portkey -> Direct OpenAI) to ensure the chat never dies.
3. **Lazy Loading**: The Emoji Picker (~270kB) is only loaded when requested, keeping the initial bundle size small.

---

## 🧠 LLM Implementation

### Provider
- **Primary**: **OpenAI (GPT-4o)** via the **Portkey AI SDK**.
- **Why Portkey?**: It adds observability (logging), caching, and reliability without changing the core business logic.

### Prompting Strategy
The agent behaviour is defined in `server/src/services/llm.ts` using a structured **System Prompt**:

1.  **Persona**: "Spur Mart" Customer Support Agent (Polite, Professional).
2.  **Context**: Awareness of shipping locations (USA/India) and policies.
3.  **Knowledge Base**: Hardcoded facts about specific products, hours, and returns to prevent hallucinations.
4.  **Guardrails**:
    - **Formatting**: Strictly limit responses to < 3 sentences.
    - **Fallback**: Explicit instruction to refer to human support for unknown queries.
    - **Greeting**: Specific branded greeting ("Welcome to Spur Mart") triggered on user hellos.

---
