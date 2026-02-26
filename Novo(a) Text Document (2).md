# ⚡ TECH STACK CHEATSHEET (V3.0 GOLDEN MASTER)

## 1. Next.js App Router (v14+)
* **Server Components (RSC):** Padrão. Não use `useState` ou `useEffect` a menos que adicione `"use client"` no topo.
* **Server Actions:** Use `"use server"` no topo de arquivos em `src/actions`. Valide SEMPRE com Zod.
* **Data Fetching:** Queries diretas no componente (são `async`). Use `revalidatePath` para atualizar cache.

## 2. Tailwind CSS v4 (Strict)
* **Configuração:** Não existe mais `tailwind.config.js`. Tudo é configurado no CSS via `@theme`.
* **Sintaxe:** Use valores dinâmicos nativos (ex: `grid-cols-15` funciona sem config).
* **Dark Mode:** Base `#121212`. Classes: `dark:bg-surface-100 text-gray-100`.

## 3. Supabase & Segurança (RLS)
* **Client:** Use `createClient` do `@supabase/ssr` (cookies automáticos).
* **RLS (Row Level Security):** Obrigatório.
  * *Exemplo:* `CREATE POLICY "User Select" ON "profiles" FOR SELECT USING (auth.uid() = user_id);`
* **Triggers Anti-Recursão:** `(NEW.id IS NULL OR id <> NEW.id)` no `WHEN` clause.

## 4. Zod (Validação de Dados)
* **Schema Padrão:**
  ```ts
  import { z } from 'zod';
  const schema = z.object({
    email: z.string().email(),
    age: z.coerce.number().min(18)
  });