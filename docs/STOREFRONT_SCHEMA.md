# Storefront Data Model (Firestore)

## Collection Structure

\`\`\`
/organizations/{orgId}/professionals/{proId}/storefront/
├── config/ (document)
│   {
│     slug: "jane-skincare-london",
│     theme: "luxury",
│     custom_colors: {
│       primary: "#D4AF37",
│       secondary: "#0a0a0a",
│       accent: "#ffffff",
│       text: "#f5f5f5"
│     },
│     is_published: false,
│     created_at: timestamp,
│     updated_at: timestamp
│   }
├── components/ (subcollection)
│   ├── org-hero/ (MANDATORY)
│   │   {
│   │     type: "org-hero",
│   │     position: 0,
│   │     is_visible: true,
│   │     data: {
│   │       logo_url: "gs://...",
│   │       hero_image: "gs://...",
│   │       business_name: "Skintight",
│   │       description: "Luxury skincare solutions",
│   │       tagline: "Great skin starts with a great routine"
│   │     }
│   │   }
│   ├── services/ (MANDATORY)
│   │   {
│   │     type: "services",
│   │     position: 1,
│   │     is_visible: true,
│   │     data: {
│   │       title: "Our Services",
│   │       services: [
│   │         {
│   │           service_id: "svc_123",
│   │           image_url: "gs://...",
│   │           name: "Facials",
│   │           description: "Bespoke facials",
│   │           variants: [
│   │             {
│   │               variant_id: "var_1",
│   │               name: "HydraFacial",
│   │               price: 150,
│   │               currency: "GBP",
│   │               duration_minutes: 60,
│   │               description: "Deep hydration"
│   │             }
│   │           ]
│   │         }
│   │       ]
│   │     }
│   │   }
│   ├── gallery/ (optional)
│   ├── location/ (optional)
│   ├── about/ (optional)
│   ├── testimonials/ (optional)
│   ├── social/ (optional)
│   └── faq/ (optional)
\`\`\`

## Themes (Constants)

\`\`\`javascript
{
  luxury: {
    name: "Luxury",
    colors: { primary: "#D4AF37", secondary: "#0a0a0a", accent: "#ffffff", text: "#f5f5f5" }
  },
  minimalist: {
    name: "Minimalist",
    colors: { primary: "#000000", secondary: "#ffffff", accent: "#cccccc", text: "#333333" }
  },
  vibrant: {
    name: "Vibrant",
    colors: { primary: "#FF6B6B", secondary: "#1a1a1a", accent: "#FFD93D", text: "#ffffff" }
  },
  contemporary: {
    name: "Contemporary",
    colors: { primary: "#4A90E2", secondary: "#f7f7f7", accent: "#50E3C2", text: "#333333" }
  }
}
\`\`\`

## Booking Data (Created from Storefront)

\`\`\`
/organizations/{orgId}/bookings/{bookingId}
{
  service_variant_ref: "professionals/{proId}/services/{serviceId}/variants/{variantId}",
  client_email: "user@example.com",
  client_name: "Jane Doe",
  client_phone: "+44...",
  scheduled_at: timestamp,
  duration_minutes: 60,
  price: 150,
  status: "pending",
  source: "storefront",
  created_at: timestamp
}
\`\`\`
