# Next.js Navbar Gallery

A collection of modern, responsive, and accessible **navbar designs** built with
**Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Framer Motion**.

Each navbar example is completely self-contained with its own folder, components, and demo page — perfect for learning, customization, or copy-pasting into your own projects.

---

## 🚀 Live Preview

[https://nextjs-navbar-gallery.vercel.app](https://nextjs-navbar-gallery.vercel.app)

---

## 🧱 Features

- ⚡ **Built with Next.js App Router**
- 🎨 **Styled using Tailwind CSS**
- 🧠 **Animated with Framer Motion**
- 🔒 **Accessible & mobile-friendly**
- 🧩 **Each navbar variant is self-contained** (`app/(examples)/navbars/type/variant`)
- 📚 **Gallery homepage** with descriptions and demo links
- 🧭 Supports **single-page** and **multi-page** navbar types
- 🧰 Ready for easy expansion — just add your own folder to create a new variant

---

## 🗂️ Folder Structure

```

app/
├─ page.tsx # Gallery homepage
├─ (examples)/
│ └─ navbars/
│ ├─ page.tsx # Navbars overview (optional)
│ ├─ multipage/
│ │ ├─ navbar1/
│ │ │ ├─ page.tsx # Demo page for Navbar 1
│ │ │ ├─ Navbar.tsx
│ │ │ ├─ components/
│ │ │ └─ styles.module.css
│ │ └─ navbar2/
│ ├─ singlepage/
│ │ └─ navbar1/
│ │ └─ navbar2/
│ └─ side-drawer/ (maybe in future)
│ └─ drawer1/ (maybe in future)

```

---

## 🧠 Types of Navbars

| Type                         | Description                                                                                  |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| **Multi-page**               | Traditional navbars for sites with multiple routes (active route highlight, dropdowns, etc.) |
| **Single-page**              | Anchor-based navbars for landing pages and scroll animations                                 |
| **Side drawer / Off-canvas** | Mobile-first full-screen or side-slide menus                                                 |
| **Advanced**                 | Mega menus, auth-aware headers, and animated navbars (coming soon)                           |

---

## 🧑‍💻 Getting Started

### 1️⃣ Clone the repo

```bash
git clone https://github.com/s54a/nextjs-navbar-gallery.git
```

```bash
cd nextjs-navbar-gallery
```

### 2️⃣ Install dependencies

```bash
pnpm install
```

### 3️⃣ Run the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧩 Add a new Navbar

To create your own navbar variant:

1. Duplicate an existing folder inside `app/(examples)/navbars/<type>/`.
2. Rename it, e.g. `navbar3` or `hero`.
3. Modify `Navbar.tsx` and `page.tsx` to your liking.
4. Add its info to the `CARDS` array in `app/page.tsx` to display it on the gallery grid.

---

## 🛠️ Tech Stack

- **Next.js 15+ (App Router)**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**
- **pnpm** (package manager)

---

## 🧭 Roadmap

- [x] Init

### Project Initialized By pnpm create t3-app

## 🤝 Contributing

Contributions and suggestions are welcome!
If you’d like to add a new navbar, open a PR or create an issue describing your idea.

---

## 📄 License

MIT © [https://github.com/s54a](https://github.com/s54a)

---
