# Horizon Engine

Horizon is the mission-critical backend engine and API gateway powering **11:59 AI**—an AI-driven social media workflow automation platform. 

Operating under a decoupled microservice topology, Horizon acts as the secure middle-tier gatekeeper that handles structural user identity verification, payload parsing, database persistence, and orchestrates downstream asynchronous AI automation jobs via n8n integration layers.

---

## Security Architecture (Defense-in-Depth)

Horizon is built from the ground up prioritizing edge security metrics and payload validation:

* **Identity Guardrails:** Integrated natively with Clerk's cryptographic runtime middleware. Every API dispatch verifies incoming JSON Web Tokens (JWT) locally via public key signature mathematics before hitting operational logic.
* **Volumetric Protection (DoS/Brute Force):** Rate-limiting parameters are strictly enforced globally, throttling abusive client IPs automatically.
* **Payload Boundary Rules:** Body parsers reject incoming JSON strings scaling past strict size thresholds (`10kb`), preventing V8 memory thread allocation attacks.
* **Header Hardening:** Powered by Helmet middleware to automatically deploy security headers, eliminating common web vectors like XSS, clickjacking, and mime-type sniffing.
* **Explicit Origin Whitelisting:** Strict Cross-Origin Resource Sharing (CORS) rules lock communication lanes down specifically to the authorized frontend interface origin.

---

## System Stack & Dependencies

* **Runtime Environment:** Node.js (ESM Module System Syntax)
* **Core Framework:** Express.js
* **Authentication & Security:** `@clerk/clerk-sdk-node`, `helmet`, `cors`, `express-rate-limit`
* **Environment Orchestration:** `dotenv`
* **Development Engine:** `nodemon` (Hot-reloading runtime execution tracking)

---

## 📁 Repository Blueprint

```text
├── config/             # Future structural index trackers (Database, System Logging)
├── middleware/         # Custom authentication hooks & processing filters
├── routes/             # Segmented API execution files
├── .env.example        # Version-controlled configuration skeleton
├── .gitignore          # Version control exemption matrices
├── index.js            # Main application bootstrapper & configuration hook
└── package.json        # Manifest parameters and platform engines