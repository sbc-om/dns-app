Here’s a complete `copilot-instructions.md` you can put in the root of your project:

---

# Copilot Instructions – DNA Web App

You are helping build a **modular, bilingual web application** using **Next.js 16**, **LMDB** as the database, and **shadcn/ui** for the UI.

The project has:

* A **public landing area** (Home, About, Contact, etc.).
* An **authenticated panel/dashboard** area.
* A **dynamic access control system** where permissions can be assigned to users and groups for any resource created in the app.

> Important: **Do not use Persian or Arabic text in the codebase.**
> All code (identifiers, comments, strings in code) must be in English.
> Localized content should live in translation files only.

---

## 1. Tech Stack & Core Requirements

**Framework**

* Use **Next.js 16** with the **App Router** (`app/` directory).
* Use **TypeScript** everywhere.

**UI**

* Use **shadcn/ui** as the main component library.
* Layout must be **responsive** and clean.

**Database**

* Use **LMDB** as the primary database (file-based, NoSQL-style).
* Design data models and repositories around LMDB access.

**Internationalization**

* The app must be **bilingual: English and Arabic**.
* Implement i18n with:

  * A common translation mechanism (e.g., JSON translation files per locale).
  * A **language switcher** (EN / AR) visible on:

    * Public pages.
    * Inside the dashboard.
  * Proper **RTL support** for Arabic (direction, alignment, etc.).

**Access Control**

* Build a **dynamic permission system**:

  * Any resource created in the system must automatically be registered in the access control system.
  * Permissions can be assigned to:

    * Individual users.
    * Groups/roles.
  * Access to any feature or resource must be checked based on the current user’s assigned permissions.
* Permissions must be **data-driven** and **modular**, not hard-coded per route.

---

## 2. High-Level Features

The app is split into two main areas:

### 2.1 Public (Landing) Area

Pages:

1. **Home / Landing**

   * Short marketing description of the program.
   * Call-to-action buttons: “Login” and “Sign Up”.

2. **About**

   * Simple editable content sections about the program.

3. **Contact**

   * Contact form (name, email, message).
   * Show basic contact info.

4. **Auth**

   * **Login** page (email/username + password).
   * **Sign Up** page (basic user registration).

### 2.2 Panel / Dashboard Area

* Authenticated users can log in and access a **panel**.
* Each user sees **only what their permissions allow**:

  * Some users may see more modules.
  * Some may see less, or specific resources only.
* The panel should use:

  * A **sidebar navigation** (using shadcn/ui components).
  * A **top bar** (language switcher, user menu, etc.).
* The system is **modular**, so new modules can be added with:

  * Their own pages.
  * Their own access control entries.
  * Their own LMDB collections or namespaces.

---

## 3. Project Structure

Copilot, follow this structure as a baseline (adapt as needed, but keep it clean and modular):

```text
src/
  app/
    (public)/
      layout.tsx
      page.tsx               # Landing / Home
      about/
        page.tsx
      contact/
        page.tsx
      auth/
        login/
          page.tsx
        register/
          page.tsx
    (dashboard)/
      layout.tsx             # Dashboard shell: sidebar + top bar
      page.tsx               # Dashboard home
      modules/
        ...                  # Feature modules live here
  lib/
    db/
      lmdb.ts                # LMDB connection and helpers
      repositories/          # Repositories per aggregate
        userRepository.ts
        roleRepository.ts
        permissionRepository.ts
        resourceRepository.ts
    auth/
      authProvider.ts        # Auth context/session helper
      requireAuth.ts         # Server-side protections
    access-control/
      permissions.ts         # Permission types and helpers
      accessRegistry.ts      # Dynamic resource registration
      checkAccess.ts         # Centralized access check logic
    i18n/
      i18nConfig.ts
      getDictionary.ts       # Load translations
    ui/
      layout/
      components/
  modules/
    users/
      ...                    # Module-specific logic (routes, services, hooks)
    roles/
      ...
    resources/
      ...
  config/
    accessControl.ts         # Default roles, built-in permissions
    i18n.ts                  # Supported languages, default locale
```

Guidelines for Copilot:

* Place **shared logic in `lib/`**.
* Place **feature-specific logic in `modules/`**.
* App routes live in `app/`, but route handlers can call into modules/lib.

---

## 4. Authentication & Membership

Implement a basic **sign-up / sign-in** flow:

* Users can **register** via the public “Register” page.
* After registration, users can **log in** and are redirected to the dashboard.
* Store users and credentials in LMDB.
* Use a simple sessions mechanism (JWT-based or session tokens) compatible with Next.js 16.

Copilot, when generating auth code:

* Keep password handling secure (hashing, never storing plain text).
* Store the user’s **id**, **email/username**, and **role/group info**.
* Expose helper functions like:

  * `getCurrentUser()`
  * `getUserPermissions(userId)`
  * `requireAuth()` (for server components/routes).

---

## 5. Dynamic Access Control System

This is one of the **most important parts**.

We need:

### 5.1 Permission Model

Use a generic model, for example:

* `User`
* `Group` (or `Role`)
* `Permission`:

  * `resourceType` (e.g. `"module"`, `"page"`, `"entity"`)
  * `resourceKey` (e.g. `"dashboard.users"`, `"module.reports"`, `"entity.student.123"`)
  * `action` (e.g. `"read"`, `"write"`, `"manage"`)

Relationships:

* A user can:

  * Belong to one or more **groups**.
  * Have **direct permissions**.
* A group can:

  * Have multiple permissions.
* Effective permissions for a user = direct + inherited from groups.

### 5.2 Automatic Resource Registration

Requirement:

* **Whenever we create a new resource/module/feature**, it must be automatically registered in the system so that it appears in the access control configuration.

Implementation idea for Copilot:

* Define a **central registry** in `lib/access-control/accessRegistry.ts`:

  * Expose functions to:

    * `registerResource(resource: RegisteredResource)`
    * `listResources()`
  * A `RegisteredResource` might include:

    * `key`
    * `type`
    * `defaultActions`
    * `displayName` (English only in code; localization via keys)
* When a module is initialized (or on first use), call `registerResource` for its features.
* Store registered resources in LMDB so that the Admin UI can list them.

Example shape:

```ts
type RegisteredResource = {
  key: string;          // "dashboard.users", "module.reports"
  type: "page" | "module" | "entity";
  defaultActions: string[]; // e.g. ["read", "write", "manage"]
};
```

### 5.3 Role / Group Definition

* Provide a **Role management module** where Admin can:

  * Create/update roles/groups.
  * Assign permissions to roles.
  * Assign roles to users.

### 5.4 Permission Checking

Create centralized helpers:

* `canUserPerformAction(params: { userId, resourceKey, action })`
* `withAccessCheck(component, requiredPermissions)`
* Route-level checks for the dashboard.

In the dashboard:

* Only render a menu item if the user has permission.
* Only allow access to a page if the user has permission.

Copilot, always **reuse the centralized check** instead of re-implementing permission logic.

---

## 6. Internationalization & RTL

Implement i18n with these rules:

* Supported locales: **`en`** and **`ar`**.

* Use translation dictionaries, e.g.:

  ```ts
  // lib/i18n/getDictionary.ts
  export async function getDictionary(locale: "en" | "ar") { ... }
  ```

* For each text shown in the UI:

  * Use a translation key.
  * Do not hard-code long text strings in components.

Layout behavior:

* If locale is `en` → `dir="ltr"`, left-aligned.
* If locale is `ar` → `dir="rtl"`, right-aligned, invert layout where needed.

Add a **language switcher**:

* In the public layout.
* In the dashboard top bar.

The switcher should:

* Change locale segment in the URL (if using localized routes), or
* Change locale in a cookie / context, then refresh.

---

## 7. UI & Layout with shadcn/ui

Use shadcn/ui to build:

* **Public layout**: header, footer, main content.
* **Dashboard layout**:

  * Left **sidebar** (navigation).
  * Top bar (user menu, language switcher).
  * Main content area.

Guidelines:

* Use consistent components for:

  * Buttons
  * Inputs
  * Forms
  * Tables
  * Cards
* Keep design **minimal and clean**.

---

## 8. Coding Rules & Conventions

Copilot must follow these rules:

1. **Language in code**

   * No Persian or Arabic text in:

     * Variable names
     * Function names
     * Comments
     * Hard-coded strings
   * Only use English in code.
   * Use translation keys for user-facing text.

2. **TypeScript**

   * Use strict typing.
   * Define shared types in `lib/` or `modules/` as needed.

3. **Modularity**

   * Each feature/module should have:

     * Its own routes under `app/(dashboard)/modules/...` or similar.
     * Services/repositories in `modules/<feature>/`.
   * Shared building blocks go into `lib/` or `src/components/`.

4. **Reuse access control**

   * Never hard-code “isAdmin” checks inside components.
   * Always use centralized permission helpers.

5. **Clean, predictable structure**

   * Organize files by feature and responsibility.
   * Prefer small, focused components and functions.

---

## 9. Example Prompts for This Project

These are examples of how you (Copilot) will be asked to generate code:

* “Create a LMDB repository for users with functions to create, update, find by id, and find by email.”
* “Add a dynamic sidebar in the dashboard that shows menu items based on the current user permissions.”
* “Generate a role management page where Admin can create roles and assign resources and actions to each role using shadcn/ui components.”
* “Implement a language switcher component that toggles between English and Arabic and updates the layout direction.”
* “Create a helper function `canUserPerformAction` that loads user roles and permissions from LMDB and checks if the user can perform a specific action on a given resource key.”

 