# 🍳 Palyt Kitchen Inventory & Menu Operations Platform

A robust, reactive, and modern restaurant kitchen inventory management and live menu availability system. Built for the **Palyt Engineering Intern Task**.

---

## 🌟 Modern UI/UX Redesign & Production Features

The application features a modern restaurant dashboard interface with a warm, professional culinary palette:

- **Primary Accent**: `#FF7A00` (Warm Culinary Orange)
- **Secondary Accent**: `#6366F1` (Iris / Indigo)
- **Status Accents**: `#10B981` (Emerald Green for Available/Healthy), `#FF4D6D` (Coral Red for Out of Stock), `#F59E0B` (Amber for Below Par)
- **Background**: `#F8FAFC` (Clean Modern Slate)
- **Sidebar & Top Navigation**: Quick navigation across `Dashboard`, `Inventory`, `Menu`, `Orders`, and `Insights`, universal search with instant filtering, notification alerts for low stock items, and user profile badges.
- **KPI Summary Cards**: Real-time stats on `Total Ingredients (15)`, `Low Stock Items (1)`, `Available Dishes (5/6)`, and `Menu Readiness (83%)`.
- **Diner Menu with Food Photography**: High-definition culinary images for every menu dish with real-time stock availability badges, ingredient breakdown chips, and instant portion ordering.
- **Live Inventory Engine**: Responsive table with live stock status indicators, safety par levels, quick `+/-` restock buttons, and dependency guards.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** (v9+ or v10+)

### 1. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/snehareddy2112/Palyt-assignment-.git
cd Palyt-assignment-
npm install
```

### 2. Run the Development Server
Start the local Vite dev server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Tests
Execute the complete Vitest test suite (50 unit & integration tests):
```bash
npm test
```

To run tests in interactive watch mode:
```bash
npm run test:watch
```

### 4. Production Build
Type-check and create an optimized production bundle:
```bash
npm run build
```

---

## ☁️ Deployment on Vercel

The project includes ready-to-deploy configuration for [Vercel](https://vercel.com/) with single-page app routing in `vercel.json`.

### Option A: 1-Click GitHub Integration (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/new).
2. Import the GitHub repository: `https://github.com/snehareddy2112/Palyt-assignment-`.
3. Select Framework Preset: `Vite`.
4. Click **Deploy**. Vercel will automatically build and assign a production URL.

### Option B: Deploy via Vercel CLI
```bash
# Log in to Vercel
npx vercel login

# Deploy production build
npx vercel --prod
```

---

## 🧠 Business Logic & Domain Architecture

The core domain logic is decoupled into pure, deterministic TypeScript modules under `src/domain/`:

```
src/
├── data/
│   ├── stock.json              # Kitchen inventory source data
│   └── recipes.json            # Menu dishes, pricing & portion recipes
├── domain/
│   ├── types.ts                # TypeScript interfaces & types
│   ├── units.ts                # Unit conversion & normalization layer
│   ├── inventory.ts            # Stock CRUD & input validation
│   ├── recipe.ts               # Availability checking & dependency analysis
│   ├── order.ts                # Atomic order deduction engine
│   └── __tests__/              # Comprehensive Vitest test suite
│       ├── units.test.ts
│       ├── availability.test.ts
│       ├── order.test.ts
│       ├── dependency.test.ts
│       └── validation.test.ts
├── context/
│   └── KitchenContext.tsx      # React state provider connecting domain logic
└── components/
    ├── Sidebar.tsx             # Collapsible modern restaurant navigation
    ├── Header.tsx              # Universal search & notification bell
    ├── DashboardMetrics.tsx    # Live inventory & menu KPI cards
    ├── InventoryView.tsx       # Stock table, search, filters & quick adjust
    ├── MenuView.tsx            # Live diner menu with food cards & order triggers
    ├── IngredientModal.tsx     # Add / edit ingredient dialog with validation
    ├── DeleteConfirmModal.tsx  # Recipe dependency guard modal
    ├── EngineeringWriteupModal.tsx # In-app design decisions viewer
    └── Toast.tsx               # Real-time action & deduction toast notifications
```

---

## 📐 Core Domain Rules & Solutions

### 1. Unit Normalization Layer (`src/domain/units.ts`)
- **The Challenge**: Kitchens purchase ingredients in bulk (`kg`, `L`), while cooking recipes measure portions in smaller prep units (`g`, `ml`).
- **The Solution**: Centralized normalization to base metric units:
  - **Mass base unit**: Grams (`g`) where `1 kg = 1000 g`.
  - **Volume base unit**: Millilitres (`ml`) where `1 L = 1000 ml`.
- **Precision**: Calculations use clean decimal rounding (e.g. `1.4 kg - 180 g = 1.22 kg`) avoiding JavaScript binary floating-point drift.
- **Safety**: Conversions across incompatible physical dimensions (e.g., mass `g` to volume `ml`) throw strict errors.

### 2. Menu Availability Rule (`src/domain/recipe.ts`)
- **The Exact Rule**: A dish is **Available** if and only if **every** ingredient it uses satisfies:
  $$\text{current\_quantity} \ge \text{par\_level}$$
- If **any** single ingredient drops below its par level ($\text{current\_quantity} < \text{par\_level}$) or is missing from stock, the dish immediately becomes **Unavailable**.
- **Reactivity**:
  - Restocking an ingredient brings all affected dishes back to the menu.
  - Raising an ingredient's par level above its current stock immediately takes dishes off the menu without consuming physical stock.

### 3. Atomic Order Flow (`src/domain/order.ts`)
When a diner orders a dish:
1. The recipe is resolved and ingredient portion requirements are converted into each stock item's native storage unit.
2. The engine performs **all validation checks upfront**: dish existence, ingredient presence, and physical sufficiency ($\text{stock} \ge \text{required}$).
3. **Atomicity Guarantee**: If any ingredient fails, zero deductions occur and an informative error is returned. If valid, deductions are applied in one atomic transaction and menu availability updates immediately.

### 4. Ingredient Deletion Policy (`src/domain/recipe.ts`)
- **Policy**: If an ingredient is referenced by one or more menu recipes, **deletion is strictly disallowed**.
- **Feedback**: The UI and engine return an explicit explanation listing the dependent dishes (e.g. *"Cannot delete Cashews because it is required by: Paneer Butter Masala, Shahi Paneer Korma"*).
- **Safe Deletion**: Unused ingredients (e.g., `Bay Leaves`, `Saffron`) can be deleted safely.
- **Rationale**: Deleting an ingredient referenced by an active recipe leaves dangling references and causes runtime failures during order placement.

### 5. Input Validation Rules (`src/domain/inventory.ts`)
The system strictly prevents nonsensical inventory records:
- **Ingredient Name**: Must be non-empty and unique (case-insensitive deduplication).
- **Quantity & Par Level**: Must be valid non-negative numbers ($\ge 0$).
- **Unit**: Must be a supported unit (`kg`, `g`, `L`, `ml`, `count`, `pcs`).

---

## 📝 Engineering Write-up

### 1. The Calls Made
- **Mixed Units in Raw Data**: The provided `stock.json` had `Paneer`, `Tomatoes`, and `Onions` in `kg`, while `recipes.json` used `g`. Rather than scattering `* 1000` in UI components, we established a standalone unit conversion domain module.
- **Missing Recipe Ingredients in Stock**: We noticed that `Refined Flour` (used in Butter Naan) and `Cumin Seeds` (used in Veg Pulao & Jeera Rice) were in `recipes.json` but absent from the initial `stock.json`. We treated missing ingredients as 0 stock, correctly marking those dishes Unavailable until added via the inventory manager.
- **Par vs. Portion Edge Case**: In `stock.json`, `Green Peas` has 30g stock with a par of 10g. While 30g is above par, `Veg Pulao` requires 50g. We enforced physical sufficiency validation during ordering so that stock never silently goes negative.

### 2. How Correctness Was Checked
- **Automated Vitest Suite**: 50 tests verifying unit conversion math, availability edge cases, multi-ingredient ordering, delete guards, and input validation.
- **Manual End-to-End Scenarios**:
  1. *Initial State*: `Chicken Biryani` starts **Unavailable** because `Chicken` stock is 0 kg (par 1 kg).
  2. *Order Execution*: Ordered `Paneer Butter Masala` and verified Paneer decreased from 1.4 kg to 1.22 kg, Tomatoes from 6 kg to 5.85 kg, and Cashews from 300g to 285g.
  3. *Threshold Crossing*: Repeated orders until Cashews dropped below 250g par, observing `Paneer Butter Masala` and `Shahi Paneer Korma` immediately turn Unavailable.
  4. *Par Reactivity*: Restocked Chicken to 1.5 kg (Biryani appeared), then raised Paneer par level to 1.5 kg (Paneer dishes disappeared without orders).
  5. *CRUD & Deletion*: Attempted to delete `Cashews` (blocked with dish list); deleted `Bay Leaves` (succeeded). Added `Refined Flour` (Butter Naan became available).
- **What could still go wrong even if tests pass?**
  - In a distributed multi-terminal restaurant environment, simultaneous orders across waiter POS tablets could trigger race conditions without database-level transactional locks.

### 3. What I Would Build Next
1. **Automated Purchase Orders**: Trigger automated supplier email drafts or purchase tickets when stock crosses below par.
2. **Kitchen Prep & Yield Loss Tracking**: Support wastage percentages (e.g. peeling onions accounts for ~15% yield loss).
3. **Table Ticket System**: Group multi-dish orders per diner table with order status stages (Ordered $\rightarrow$ Prepping $\rightarrow$ Served).
4. **Recipe Creator UI**: Allow head chefs to create and edit recipes and portion sizes directly.

---

## 🤖 AI Usage Disclosure

AI assistance was utilized during this task for boilerplate scaffolding, creating comprehensive Vitest test coverage assertions, and styling assistance with Tailwind CSS classes. All domain architecture, business rules, unit normalization logic, and engineering decisions were manually verified, tested, and implemented.
