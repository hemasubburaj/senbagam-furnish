# Senbagam Furniture — Fullstack E-commerce Site

A fullstack furniture store: Express + MongoDB (Mongoose) backend, and a
vanilla HTML/CSS/JS storefront (no build step, no framework lock-in).
Currently seeded with Senbagam Furniture's real combo packages.

## What's included

**Backend** (`/backend`)
- Express REST API
- MongoDB via Mongoose (local MongoDB or MongoDB Atlas — your choice)
- Endpoints for products, categories, testimonials, newsletter signups,
  contact messages, and orders (checkout)
- Login-protected admin dashboard at `/admin` (see below)
- Seed script that loads the 3 combo packages + sample testimonials

**Frontend** (`/frontend`)
- Static HTML/CSS/JS, served directly by Express — open it straight in a
  browser or serve it from any static host
- Pages: Home, Products (category filter + search), Product detail, Cart,
  Checkout, About, Testimonials, Contact, 404
- Cart is stored in `localStorage` and syncs to the backend at checkout
- Prices are formatted in ₹ (INR)

## Getting started

You need a MongoDB database — either installed locally or a free
[MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

```bash
cd backend
cp .env.example .env
# edit .env and set MONGODB_URI to your connection string
npm install
npm run seed      # loads the 3 combo products + testimonials
npm start          # starts the server on http://localhost:4000
```

Then open **http://localhost:4000** in your browser. The frontend is served
by the same Express server, so there's nothing else to run.

### Local MongoDB
If you install MongoDB locally (Community Server), the default
`MONGODB_URI` in `.env.example` (`mongodb://127.0.0.1:27017/furnish`) will
work as-is — just make sure `mongod` is running before `npm start`.

### MongoDB Atlas (no local install needed)
1. Create a free cluster at mongodb.com/atlas
2. Get your connection string (Database → Connect → Drivers)
3. Paste it into `.env` as `MONGODB_URI`, replacing `<user>`/`<password>`
   with your database user's credentials

## Admin panel

There's a login-protected admin dashboard at **`/admin`**. It is not linked
anywhere in the public site (no nav link, no sitemap entry) — the only way
in is knowing the URL and the login.

- URL: `http://localhost:4000/admin`
- Default login (from `.env.example`): username `admin`, password `changeme123`
- **Change the password before deploying anywhere real:**
  ```bash
  cd backend
  node scripts/hash-password.js "your-new-password"
  ```
  Copy the printed `ADMIN_PASSWORD_HASH` value into your `.env` file.

What you can do from the dashboard:
- **Products** — create, edit, delete, mark featured, adjust stock
- **Orders** — view every order placed at checkout, update status
  (pending → processing → shipped → delivered → cancelled)
- **Newsletter** — see every subscribed email
- **Messages** — read contact form submissions

Notes on how it's protected:
- Login uses a bcrypt-hashed password (never stored in plain text) and an
  `express-session` cookie (`httpOnly`, 8-hour expiry).
- Every `/api/admin/*` route checks the session server-side — the admin
  HTML pages live outside `frontend/` and are never served by the public
  static file handler, so there's no way to load them without passing
  through the login check first.

## Project structure

```
furnish-fullstack/
├── backend/
│   ├── db/
│   │   ├── connect.js     # Mongoose connection
│   │   └── seed.js        # loads combo products + testimonials
│   ├── models/
│   │   ├── Product.js
│   │   ├── Testimonial.js
│   │   ├── NewsletterSubscriber.js
│   │   ├── ContactMessage.js
│   │   ├── Order.js
│   │   └── schemaOptions.js
│   ├── middleware/
│   │   └── requireAdmin.js
│   ├── admin-views/        # login + dashboard HTML (not public, session-gated)
│   │   ├── login.html
│   │   └── dashboard.html
│   ├── scripts/
│   │   └── hash-password.js
│   ├── routes/
│   │   ├── products.js
│   │   ├── testimonials.js
│   │   ├── newsletter.js
│   │   ├── contact.js
│   │   ├── orders.js
│   │   ├── admin.js        # /admin login, logout, dashboard page
│   │   └── adminApi.js     # /api/admin/* — protected CRUD
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── index.html          products.html        product.html
    ├── cart.html           checkout.html         about.html
    ├── testimonials.html   contact.html          404.html
    ├── css/
    ├── js/
    └── images/
        ├── combos/          # real combo package photos
        └── brand/           # Senbagam logo / founder photo
```

## API reference

| Method | Path                        | Description                          |
|--------|------------------------------|---------------------------------------|
| GET    | `/api/products`              | List products (`?category=`, `?q=`, `?featured=1`) |
| GET    | `/api/products/categories`   | Distinct category list                |
| GET    | `/api/products/:slug`        | Single product                        |
| GET    | `/api/testimonials`          | List testimonials                     |
| POST   | `/api/newsletter`            | Subscribe an email                    |
| POST   | `/api/contact`               | Submit a contact message              |
| POST   | `/api/orders`                | Place an order (checkout)             |
| GET    | `/api/orders/:id`            | Look up an order                      |

## Managing products

Easiest way: log into `/admin` and use the Products tab (add/edit/delete,
no code needed).

To reset back to the default 3 combo packages, edit the `combos` array in
`backend/db/seed.js` and run `npm run seed` again — this wipes and
re-inserts `products` and `testimonials` only; it won't touch orders,
newsletter signups, or contact messages.

## Notes

- The cart lives in `localStorage`, so it's per-browser, not per-account.
  There's no customer login/auth in this starter.
- Product images for the 3 combos are the real photos supplied by
  Senbagam Furniture, stored in `frontend/images/combos/`.
