# Storefront API Routes

## Dashboard Routes (Authenticated)

### Create Storefront
\`POST /api/organizations/{orgId}/professionals/{proId}/storefront\`

Request:
\`\`\`json
{
  "slug": "jane-skincare-london",
  "theme": "luxury"
}
\`\`\`

Response:
\`\`\`json
{
  "id": "storefront_123",
  "slug": "jane-skincare-london",
  "theme": "luxury",
  "custom_colors": { ... },
  "is_published": false,
  "components": [ ... ],
  "created_at": "2026-06-10T10:00:00Z"
}
\`\`\`

### Get Storefront
\`GET /api/organizations/{orgId}/professionals/{proId}/storefront\`

Response: (same as above)

### Update Storefront Config
\`PATCH /api/organizations/{orgId}/professionals/{proId}/storefront\`

Request:
\`\`\`json
{
  "theme": "minimalist",
  "custom_colors": { "primary": "#D4AF37" },
  "is_published": true
}
\`\`\`

### Get Storefront Components
\`GET /api/organizations/{orgId}/professionals/{proId}/storefront/components\`

Response:
\`\`\`json
[
  {
    "id": "org-hero",
    "type": "org-hero",
    "position": 0,
    "is_visible": true,
    "data": { ... }
  },
  {
    "id": "services",
    "type": "services",
    "position": 1,
    "is_visible": true,
    "data": { ... }
  }
]
\`\`\`

### Update Component
\`PATCH /api/organizations/{orgId}/professionals/{proId}/storefront/components/{componentId}\`

Request:
\`\`\`json
{
  "position": 2,
  "is_visible": true,
  "data": { ... component data ... }
}
\`\`\`

### Add Optional Component
\`POST /api/organizations/{orgId}/professionals/{proId}/storefront/components\`

Request:
\`\`\`json
{
  "type": "gallery",
  "position": 3,
  "data": { ... }
}
\`\`\`

### Remove Component
\`DELETE /api/organizations/{orgId}/professionals/{proId}/storefront/components/{componentId}\`

## Public Routes (No Auth)

### Get Storefront
\`GET /api/storefronts/{slug}\`

Response: (complete storefront data with theme applied)

### Create Booking from Storefront
\`POST /api/storefronts/{slug}/bookings\`

Request:
\`\`\`json
{
  "service_variant_id": "var_123",
  "scheduled_at": "2026-06-15T14:00:00Z",
  "client_name": "Jane Doe",
  "client_email": "jane@example.com",
  "client_phone": "+44..."
}
\`\`\`

Response:
\`\`\`json
{
  "booking_id": "booking_456",
  "status": "pending",
  "confirmation_url": "..."
}
\`\`\`
