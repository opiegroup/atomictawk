# OMG Platform Specification v1

## OPIE Manufacturing Group - Multi-Tenant Site Builder

**Platform Name:** OMG Site Builder  
**Master Company:** OPIE Manufacturing Group  
**Document Version:** 1.0  
**Status:** Planning

---

## 1. Source Repositories

### Import into monorepo:

| Source Repo | Destination | Purpose |
|-------------|-------------|---------|
| `opiegroup/atomictawk` | `apps/tenant` | Tenant runtime, UI patterns, dashboard |
| `opiegroup/boscotek2026` | `apps/configurator` | CPQ engine and embed widget |

New monorepo: `opiegroup/opie-platform`

---

## 2. Folder Structure

```
opie-platform/
├── apps/
│   ├── hub/                      # OMG Site Builder admin
│   ├── tenant/                   # Multi-domain tenant runtime
│   └── configurator/             # CPQ service (tenant-aware)
│
├── packages/
│   ├── ui/                       # Shared components & blocks
│   ├── modules/                  # Feature modules
│   │   ├── news/
│   │   ├── store/
│   │   ├── configurator-embed/
│   │   ├── staff-board/
│   │   ├── badges/
│   │   └── profiles/
│   ├── auth/                     # RBAC & tenant-aware auth
│   ├── database/                 # Prisma schema & migrations
│   ├── types/                    # Shared TypeScript types
│   └── config/                   # ESLint, TS, Tailwind configs
│
├── supabase/
│   ├── migrations/
│   └── functions/
│
├── turbo.json
├── package.json
└── pnpm-workspace.yaml
```

---

## 3. Tenant Routing (Critical Rules)

### Resolution Order

1. Extract `Host` header from request
2. Strip `www.`, ports, normalise to lowercase
3. Query `domain_mappings` table
4. If not found → show unknown domain page or redirect to hub
5. Attach tenant context to server request
6. Load tenant config: theme, nav, enabled modules

### Security Rules (Non-Negotiable)

| Rule | Reason |
|------|--------|
| Tenant resolved from Host header only | Client cannot spoof tenant |
| DB confirms domain mapping | Single source of truth |
| Server sets tenant in request context | Not from cookies/params |
| Client cookie is display only | Convenience, not authority |
| Every query filters by `tenant_id` | Data isolation |
| RLS enforces tenant boundaries | Defence in depth |

### Middleware Implementation (Correct Pattern)

```typescript
// apps/tenant/src/middleware.ts
// NO local Map cache - edge runtime is stateless

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || ''
  const domain = host.toLowerCase().replace(/^www\./, '').replace(/:\d+$/, '')
  
  // For local dev, use env fallback
  const isDev = domain === 'localhost' || domain.includes('localhost')
  const lookupDomain = isDev 
    ? process.env.DEFAULT_TENANT_DOMAIN || 'atomictawk.com'
    : domain
  
  // Query DB directly - add caching layer later (Upstash/Edge Config)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  
  const { data: mapping } = await supabase
    .from('domain_mappings')
    .select('tenant_id, tenants(id, slug, status, theme_config)')
    .eq('domain', lookupDomain)
    .single()
  
  if (!mapping || mapping.tenants?.status !== 'active') {
    return NextResponse.redirect(new URL('/unknown-domain', request.url))
  }
  
  // Set tenant context via headers (server-readable)
  const response = NextResponse.next()
  response.headers.set('x-tenant-id', mapping.tenant_id)
  response.headers.set('x-tenant-slug', mapping.tenants.slug)
  
  return response
}
```

### Local Development

```bash
# .env.local
DEFAULT_TENANT_DOMAIN=boscotek.com.au
```

Or use subdomain pattern: `boscotek.localhost:3000`

---

## 4. Tenant Domain Mapping

| Domain | Tenant Slug | Type |
|--------|-------------|------|
| boscotek.com.au | boscotek | B2B Industrial |
| lectrum.com.au | lectrum | B2B Industrial |
| boscostorage.com.au | bosco | B2B Storage |
| opiegroup.com.au | opiegroup | Corporate |
| gilkon.com.au | gilkon | B2B AV/Tech |
| weaponss.com.au | weaponss | B2C Retail |
| atomictawk.com | atomictawk | B2C Community |

---

## 5. Roles & Permissions

### Global Roles (Platform-wide)

| Role | Access |
|------|--------|
| `god_mode` | All tenants, all features, full access |
| `platform_admin` | All tenants, manage platform config |

### Tenant Roles (Scoped to one tenant)

| Role | Access |
|------|--------|
| `brand_admin` | Full access within tenant |
| `staff_admin` | Manage staff board, news, internal content |
| `sales` | Configurator, quotes, limited content |
| `staff` | View staff board, basic internal access |
| `customer` | Public profile, community if enabled |

### Membership Model

- A user can have multiple tenant memberships
- Each membership has one role + optional extra permissions
- One membership marked as `is_primary_tenant`

---

## 6. Modules

### Module Contract

Every module declares:
- Routes it adds
- Blocks it contributes to builder
- Permissions it requires
- Tenant config schema
- Dependencies on other modules

### Core Modules

| Module | Always On | Description |
|--------|-----------|-------------|
| `layout` | Yes | Sections, grids, containers |
| `content` | Yes | Text, images, video, CTA |
| `news` | No | Blog/articles with categories |
| `store` | No | Products, cart, checkout |
| `configurator-embed` | No | CPQ embed widget |
| `staff-board` | No | Internal announcements |
| `badges` | No | Recognition system |
| `profiles` | No | User dashboards |

### Enable/Disable Without Deploy

Modules toggled via `tenant_modules` table:
```sql
UPDATE tenant_modules 
SET enabled = true 
WHERE tenant_id = 'xxx' AND module_id = 'news';
```

Tenant runtime checks enabled modules at request time.

---

## 7. Public vs Staff Separation (Critical)

### Route Groups

```
apps/tenant/src/app/
├── (public)/           # Customer-facing, may be anonymous
│   ├── page.tsx
│   ├── products/
│   └── news/
├── (staff)/            # Requires auth + tenant membership
│   ├── dashboard/
│   ├── staff-board/
│   └── quotes/
└── (admin)/            # Requires brand_admin or higher
    ├── settings/
    └── users/
```

### Hard Rules

| Context | Rule |
|---------|------|
| Public pages | Never query private tables without auth check |
| Staff routes | Always enforce RBAC before render |
| Admin routes | Require `brand_admin` or `staff_admin` minimum |
| API routes | Check tenant + permissions on every request |

---

## 8. Configurator Evaluation & Integration

### Current State Analysis (boscotek2026)

The configurator is **production-ready** with significant existing functionality:

| Capability | Status | Notes |
|------------|--------|-------|
| Multi-brand support | ✅ Complete | BrandContext handles boscotek, argent, lectrum, weaponss |
| Role-based pricing | ✅ Complete | 6 roles: super_admin, admin, pricing_manager, sales, distributor, viewer |
| 3D visualization | ✅ Complete | React Three Fiber, brand-specific viewers |
| Quote management | ✅ Complete | Cart, submission, reference codes |
| Embed mode | ✅ Partial | Has `useEmbedMode` hook, needs enhancement |
| Edge functions | ✅ Complete | 10 Deno functions (pricing, quotes, exports) |
| Database | ✅ Complete | 54 Supabase migrations |

### Key Architecture Findings

**Strengths (Keep As-Is):**
- Procedural 3D geometry (no large model files)
- Brand-specific viewers already isolated
- Reference code generators per brand
- Pricing engine with role-based markup
- Quote line item structure with thumbnails

**Integration Points (Need Bridging):**

| Component | Current | Platform Integration |
|-----------|---------|---------------------|
| Auth | Own AuthContext | Bridge to platform RBAC |
| Brand | BrandContext | Map to tenant context |
| Database | Separate Supabase | Shared or federated |
| Edge Functions | Configurator-specific | Expose as platform services |

### Configurator-to-Platform Role Mapping

| Configurator Role | Platform Role | Access |
|-------------------|---------------|--------|
| super_admin | god_mode | Full access all brands |
| admin | brand_admin | Full access within tenant |
| pricing_manager | brand_admin | Pricing management |
| sales | sales | Configure + quote |
| distributor | sales (with tier) | Tiered pricing |
| viewer | customer | View only, request quote |

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PLATFORM AUTH                                │
│            (Single source of truth for identity)                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JWT with tenant + role claims
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CONFIGURATOR SERVICE                           │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │ Auth Bridge │  │ Brand from  │  │ Pricing w/  │             │
│  │ (validate   │  │ Tenant      │  │ Role from   │             │
│  │  platform   │  │ Context     │  │ Platform    │             │
│  │  JWT)       │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              EXISTING CONFIGURATOR ENGINE                │   │
│  │  • 3D Viewers (Boscotek, Argent, Lectrum, WeaponsS)     │   │
│  │  • Product Catalogs                                      │   │
│  │  • Pricing Service                                       │   │
│  │  • Quote Cart                                            │   │
│  │  • Reference Code Generation                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ Configuration Result
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     TENANT WEBSTORE                              │
│            (Receives cart item / quote payload)                  │
└─────────────────────────────────────────────────────────────────┘
```

### Folder Restructure for Monorepo

Current `boscotek2026/` → Split into:

```
packages/
├── configurator-engine/           # Core logic (extracted)
│   ├── pricing/
│   │   └── pricingService.ts
│   ├── reference/
│   │   ├── boscotekReference.ts
│   │   ├── argentReference.ts
│   │   ├── lectrumReference.ts
│   │   └── weaponssReference.ts
│   ├── catalogs/
│   │   ├── boscotekCatalog.ts
│   │   ├── argentCatalog.ts
│   │   ├── lectrumCatalog.ts
│   │   └── weaponssCatalog.ts
│   └── types.ts
│
├── configurator-viewers/          # 3D components (extracted)
│   ├── Viewer3D.tsx              # Base viewer
│   ├── ArgentViewer3D.tsx
│   ├── LectrumViewer3D.tsx
│   ├── WeaponsSViewer3D.tsx
│   └── components/
│       ├── DrawerStack.tsx
│       ├── CabinetDoor.tsx
│       └── ThumbnailCapture.tsx
│
apps/
├── configurator/                  # Standalone configurator app
│   ├── pages/
│   ├── components/
│   │   ├── admin/                # Keep admin dashboard here
│   │   ├── distributor/
│   │   ├── ConfiguratorControls.tsx
│   │   ├── QuoteCart.tsx
│   │   └── SummaryPanel.tsx
│   ├── contexts/
│   │   └── CatalogContext.tsx    # Uses engine packages
│   └── supabase/
│       ├── migrations/           # Keep 54 migrations
│       └── functions/            # Keep 10 edge functions
│
modules/
└── configurator-embed/            # NEW: Embed module for tenant
    ├── ConfiguratorEmbed.tsx
    ├── useConfiguratorBridge.ts
    └── types.ts
```

### Auth Bridge Pattern

```typescript
// apps/configurator/contexts/AuthBridge.tsx
// Wraps existing AuthContext to accept platform JWT

import { useEffect } from 'react'
import { useAuth as useConfiguratorAuth } from './AuthContext'

interface PlatformClaims {
  sub: string           // user_id
  tenant_id: string
  tenant_slug: string
  role: string          // platform role
  email: string
}

export function AuthBridge({ platformToken, children }) {
  const { setExternalAuth } = useConfiguratorAuth()
  
  useEffect(() => {
    if (platformToken) {
      // Decode platform JWT
      const claims = decodeJwt<PlatformClaims>(platformToken)
      
      // Map platform role to configurator role
      const configuratorRole = mapPlatformRole(claims.role)
      
      // Set auth state without Supabase sign-in
      setExternalAuth({
        userId: claims.sub,
        email: claims.email,
        role: configuratorRole,
        brandAccess: [claims.tenant_slug], // Limit to tenant's brands
      })
    }
  }, [platformToken])
  
  return children
}

function mapPlatformRole(platformRole: string): ConfiguratorRole {
  const mapping = {
    'god_mode': 'super_admin',
    'platform_admin': 'admin',
    'brand_admin': 'admin',
    'staff_admin': 'sales',
    'sales': 'sales',
    'staff': 'viewer',
    'customer': 'viewer',
  }
  return mapping[platformRole] || 'viewer'
}
```

### Tenant-to-Brand Mapping

```typescript
// Brand slug maps to tenant brands
const TENANT_BRAND_MAP = {
  'boscotek': ['boscotek'],
  'lectrum': ['lectrum'],
  'bosco': ['boscotek'],      // Uses Boscotek products
  'gilkon': ['argent'],       // Gilkon uses Argent line
  'weaponss': ['weaponss'],
  'atomictawk': [],           // No configurator
  'opiegroup': ['boscotek', 'argent', 'lectrum', 'weaponss'], // All brands
}
```

### Embed Contract (Enhanced)

Aligned with existing configurator output structures:

```typescript
interface ConfiguratorEmbedProps {
  tenantId: string           // Required
  productId: string          // Required
  mode: 'quote' | 'checkout' | 'enquiry'
  
  onComplete: (result: ConfigurationResult) => void
  onError?: (error: Error) => void
}

interface ConfigurationResult {
  configurationId: string
  configurationCode: string  // e.g., 'BTCS.1000.560.100.3D.BLK'
  payload: ConfigurationPayload
  price: PricingResult
  
  // Mode-specific
  cartItem?: QuoteLineItem   // checkout mode
  quoteReference?: string    // quote mode (e.g., 'BQ-2024-001')
  enquiryId?: string         // enquiry mode
}

// Matches existing configurator PricingResult
interface PricingResult {
  totalPrice: number
  basePrice: number
  gst: number
  currency: string
  currencySymbol?: string
  breakdown: LineItem[]
  
  // Role-specific (staff only)
  tierName?: string
  tierCode?: string
  markupPercent?: number
  retailPrice?: number
  cost?: number
  margin?: number
}

// Matches existing QuoteLineItem
interface QuoteLineItem {
  id: string
  productName: string
  configurationCode: string
  configuration: ConfigurationState
  quantity: number
  unitPrice: number
  totalPrice: number
  specsSummary: string[]
  breakdown?: LineItem[]
  thumbnail?: string         // Base64 from 3D viewer
  ogNumber?: string          // NetSuite reference
}
```

### Flow

1. Configurator accepts tenant + product context
2. User configures product
3. On complete → returns payload + pricing + SKU
4. Transaction record created automatically
5. Cart item or quote attached to user session

### Existing Edge Functions (Preserve)

| Function | Purpose | Integration |
|----------|---------|-------------|
| `calculate-price` | Role-based pricing | Call from tenant store |
| `submit-quote` | Quote submission | Triggers transaction record |
| `generate-ifc` | BIM/IFC export | Keep as-is |
| `generate-obj` | OBJ/MTL export | Keep as-is |
| `generate-data-export` | CSV/XLSX/JSON | Keep as-is |
| `generate-spec-pack` | Spec packages | Keep as-is |
| `invite-user` | User invitations | Bridge to platform auth |
| `send-quote-emails` | Email notifications | Keep as-is |
| `seed-catalog` | DB seeding | Dev only |

### Reference Code Formats (By Brand)

| Brand | Format | Example |
|-------|--------|---------|
| Boscotek | `BTCS.{width}.{depth}.{height}.{drawer}.{color}` | `BTCS.1000.560.100.3D.BLK` |
| Lectrum | `LT.{model}.{color}.{logo}` | `LT.L2001.BLK.PET` |
| Argent | `{series}ARG.{ru}.{depth}.{width}` | `5ARG.25.42.600.1000` |
| WeaponsS | `WS.{model}.{police}.{lock}` | `WS.34PC.APO.BL` |

### 3D Viewer Integration

Existing viewers to preserve:

| Viewer | Products | Approach |
|--------|----------|----------|
| `Viewer3D.tsx` | Boscotek cabinets, workbenches | Procedural geometry |
| `ArgentViewer3D.tsx` | Server racks (10/25/40/50 series) | Procedural (5,952 lines) |
| `LectrumViewer3D.tsx` | Lecterns (Aero/Classic) | OBJ/MTL model loading |
| `WeaponsSViewer3D.tsx` | Security storage | Procedural geometry |

All viewers share:
- React Three Fiber + @react-three/drei
- OrbitControls (rotate, pan, zoom)
- Warehouse HDRI lighting
- Thumbnail capture via ref
- Dark/light/photo background modes

---

## 9. Store & Transaction Tracking

### Unified Transaction Model

All purchases, quotes, and enquiries flow to `transactions` table:

| Field | Purpose |
|-------|---------|
| `tenant_id` | Tenant isolation |
| `type` | order, quote, enquiry, refund |
| `customer_id` | Link to user |
| `line_items` | Products + quantities |
| `configuration_payloads` | Full config data for configured items |
| `total_cents` | Calculated total |
| `status` | Pipeline stage |
| `assigned_to` | Staff assignment |

### Dashboard Visibility

- **Brand Admin**: All tenant transactions
- **Sales**: Assigned quotes + own customers
- **Staff**: View only
- **Customer**: Own transactions

---

## 10. Data Model (Core Tables)

```sql
-- Tenants
tenants (id, slug, name, status, theme_config, settings)

-- Domain Routing
domain_mappings (id, tenant_id, domain, is_primary)

-- Modules
modules (id, slug, name, routes, blocks, permissions, config_schema)
tenant_modules (id, tenant_id, module_id, enabled, config)

-- Users & Access
users (id, email, display_name, is_god_mode, is_platform_admin)
tenant_memberships (id, user_id, tenant_id, role, extra_permissions)

-- Content (tenant-scoped)
pages (id, tenant_id, slug, layout, status)
products (id, tenant_id, slug, name, price_cents, is_configurable)

-- Transactions (unified)
transactions (id, tenant_id, type, status, customer_id, line_items, total_cents, configuration_payloads)

-- Audit
audit_log (id, tenant_id, user_id, action, entity_type, entity_id, changes)
```

### RLS Pattern (Every Table)

```sql
CREATE POLICY "Tenant isolation" ON pages
FOR ALL USING (
  tenant_id = current_setting('app.current_tenant_id')::uuid
);
```

---

## 11. Phase Rollout

### Phase 1: Platform Foundation (4-6 weeks)

- [ ] Create `opie-platform` monorepo
- [ ] Import `atomictawk` → `apps/tenant`
- [ ] Import `boscotek2026` → `apps/configurator`
- [ ] Implement domain routing middleware
- [ ] Implement tenant context provider
- [ ] Set up domain_mappings table
- [ ] Implement auth + memberships + RBAC
- [ ] Create module registry + toggles
- [ ] Atomic Tawk running as first tenant

### Phase 2: OMG Site Builder (3-4 weeks)

- [ ] Build `apps/hub` (OMG Site Builder admin)
- [ ] Tenant management CRUD
- [ ] Domain mapping UI
- [ ] User management + role assignment
- [ ] Module toggle interface
- [ ] Theme editor
- [ ] Global template management

### Phase 3: Boscotek 2026 (4-5 weeks)

**Week 11-12: Configurator Integration**
- [ ] Import `boscotek2026` into `apps/configurator`
- [ ] Extract shared packages (engine, viewers)
- [ ] Build AuthBridge for platform JWT
- [ ] Create `configurator-embed` module
- [ ] Test embed in tenant runtime
- [ ] Wire quote submission to platform transactions

**Week 13-15: Boscotek Site Build**
- [ ] Create Boscotek tenant + theme
- [ ] Build homepage with page builder
- [ ] Recreate /our-products/ structure
- [ ] Enable configurator on configurable products
- [ ] Convert community → staff board
- [ ] Adapt badges for staff motivation
- [ ] Build unified transaction dashboard

### Phase 4: Additional Brands (2-3 weeks each)

**Rollout order:**
1. Lectrum (configurator needs)
2. Bosco Storage (store-focused)
3. WeaponsS (store + community)
4. Gilkon (similar to Boscotek)
5. Opiegroup (corporate, minimal modules)

**Per brand:**
- [ ] Create tenant in OMG Site Builder
- [ ] Configure domain mapping
- [ ] Apply brand theme
- [ ] Enable required modules
- [ ] Migrate/create content
- [ ] Assign staff + roles
- [ ] UAT and go-live

---

## 12. Success Metrics

| Metric | Target |
|--------|--------|
| New tenant spin-up | < 1 day |
| Domain routing latency | < 10ms |
| Module toggle effect | Immediate |
| Theme changes | Live preview |
| Cross-tenant transaction view | Hub dashboard |

---

## 13. Next Steps

1. **Create monorepo** and import existing repos
2. **Test domain routing** with atomictawk.com
3. **Build minimal hub** for tenant management
4. **Wire configurator** into module system
5. **Deploy Boscotek** as proof of platform

---

## 14. Configurator Integration Checklist

### Auth Integration
- [ ] Create AuthBridge component
- [ ] Map platform JWT claims to configurator roles
- [ ] Handle guest/anonymous pricing (viewer role)
- [ ] Pass tenant context to pricing service

### Brand/Tenant Mapping
- [ ] Define TENANT_BRAND_MAP relationship
- [ ] Theme token inheritance from platform
- [ ] Feature flag passthrough (enableBimExport, etc.)

### Cart Integration
- [ ] Implement `onAddToCart` callback
- [ ] Sync QuoteLineItem to platform cart
- [ ] Handle quantity updates bidirectionally
- [ ] Preserve thumbnail captures

### Transaction Flow
- [ ] Quote submission → platform transaction record
- [ ] Direct purchase → platform order record
- [ ] Payment gateway handoff (if checkout mode)
- [ ] Order confirmation sync

### Analytics
- [ ] Configuration started events
- [ ] Configuration completed events
- [ ] Quote funnel tracking
- [ ] 3D viewer engagement metrics

### Database Strategy
**Option A: Shared Supabase (Recommended for v1)**
- Configurator tables in same Supabase project
- Shared auth.users
- Foreign keys to platform tenants/transactions

**Option B: Federated (Future)**
- Separate configurator database
- API-only communication
- Transaction sync via webhooks

---

## 15. Dependencies Summary

### Platform Core
```json
{
  "next": "^15.x",
  "@supabase/supabase-js": "^2.x",
  "tailwindcss": "^3.x",
  "lucide-react": "^0.x"
}
```

### Configurator Specific
```json
{
  "three": "^0.160.0",
  "@react-three/fiber": "^8.15.x",
  "@react-three/drei": "^9.97.x",
  "zustand": "^5.0.x"
}
```

### Build Tools
```json
{
  "turbo": "^2.x",
  "typescript": "^5.x",
  "vite": "^6.x"
}
```

---

*Document maintained by OPIE Manufacturing Group*  
*Platform: OMG Site Builder*
