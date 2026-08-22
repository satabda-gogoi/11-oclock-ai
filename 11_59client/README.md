<div align="center">
  
  # 11:59 | AI Social Media Powerhouse
  **Automate your social media pipeline before the day ends.**

  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
  [![n8n](https://img.shields.io/badge/n8n-FF6D5A?style=for-the-badge&logo=n8n&logoColor=white)](https://n8n.io/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

---

> **11:59** is an AI-powered orchestration console built for creators and tech teams. Connect native accounts, construct structural prompt parameters, and execute programmatic publishing. Currently featuring the **Horizon Engine (v1)** optimized exclusively for LinkedIn workflows.

##  Core Features (v1 MVP)

*   **Direct Instant Generation:** Inject rough instructions into our specialized LinkedIn model layer. The machine writes structural hooks, adds line break layouts, and pushes live instantly.
*   **The Smart Calendar (Matrix):** Queue generated pipelines up to weeks ahead. Background automation threads watch the scheduler, pulling text schemas from MongoDB to execute uploads seamlessly at exact targeted timestamps.
*   **Secure App Integration:** Powered by Clerk, session monitoring and instant route safeguards run completely client-side to protect your social tokens.
*   **Dual-Theme Native Interface:** A stunning, glassmorphism-inspired UI featuring global light and dark mode tokens built natively with Tailwind CSS.
*   **Prompt Ancestry:** Cache and quickly reuse previously successful prompt tokens from your workspace history.

---

##  Architecture Stack

This platform operates on a decoupled, high-performance orchestration core:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend UI** | React + Vite + Tailwind | Ultra-fast client, interactive workspace, and dual-theme routing. |
| **Authentication**| Clerk JS | Secure user session handling and protected route management. |
| **Backend API** | Express JS | Custom execution endpoints, data sanitization, and webhook bridging. |
| **Automation** | n8n | Flow-based node graphs for offloading logic, scheduling, and third-party APIs. |
| **Database** | MongoDB | Fast schema collections synchronized natively with n8n operational hooks. |

---

##  Getting Started

Follow these instructions to spin up the 11:59 console in your local development environment.

### Prerequisites
* Node.js (v18+)
* A [Clerk](https://clerk.com/) Account (for API Keys)
* A local or cloud instance of [n8n](https://n8n.io/)
* MongoDB URI

### 1. Clone the Repository
```bash
git clone https://github.com/dev-satabda/11-59Ai.git
cd 11-59Ai