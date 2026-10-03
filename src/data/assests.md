# SUMSHODHINI asset upload locations

The frontend resolves image keys through `src/utils/assets.js`. Missing files render explicit placeholders.

## QR images

| Activity | Exact upload path | Configuration reference |
|---|---|---|
| Workshop / Introduction to LLMs | `src/assets/images/qr/workshop-2026.webp` | `src/data/payment.js` → `PAYMENT_QR_CONFIG.llm.qr` |
| Code & Build | `src/assets/images/qr/code-build-2026.webp` | `PAYMENT_QR_CONFIG['code-build'].qr` |
| IT Innovation Challenge | `src/assets/images/qr/innovation-2026.webp` | `PAYMENT_QR_CONFIG.innovation.qr` |
| Cyber Quest | `src/assets/images/qr/cyber-quest-2026.webp` | `PAYMENT_QR_CONFIG['cyber-quest'].qr` |
| Design to Deploy | `src/assets/images/qr/design-deploy-2026.webp` | `PAYMENT_QR_CONFIG['design-deploy'].qr` |
| Tech Connect | `src/assets/images/qr/tech-connect-2026.webp` | `PAYMENT_QR_CONFIG['tech-connect'].qr` |
| Event 6 | `src/assets/images/qr/event6-2026.webp` | `PAYMENT_QR_CONFIG.event6.qr` |

Recommended QR dimensions: square, at least 800×800 px, PNG/WebP, with a sufficient quiet zone.

## SUMSHODHINI logo

`src/assets/images/sumshodhini/sumshodhini-logo-512.webp` → `src/pages/Sumshodhini.jsx` (`sumshodhini/sumshodhini-logo-512`)

Recommended: 512×512 px or larger; transparent PNG/WebP is suitable for the light circular container.

## Leadership / coordination photos

| Position | Exact upload path |
|---|---|
| Head of the Department | `src/assets/images/team/hod.webp` |
| Faculty Coordinator — first existing card | `src/assets/images/team/faculty-coordinator-1.webp` |
| Faculty Coordinator — second existing card | `src/assets/images/team/faculty-coordinator-2.webp` |
| Vice President | `src/assets/images/team/vice-president.webp` |
| General Secretary | `src/assets/images/team/general-secretary.webp` |
| Treasurer | `src/assets/images/team/treasurer.webp` |
| Technical Head | `src/assets/images/team/technical-head.webp` |
| Spokesperson | `src/assets/images/team/spokesperson.webp` |
| PR and Media Head | `src/assets/images/team/pr-media.webp` |
| Disciplinary Head | `src/assets/images/team/disciplinary-head.webp` |
| Logistics Head | `src/assets/images/team/logistics-head.webp` |

Recommended leadership photo dimensions: 800×600 px (4:3), JPG/WebP, subject centered with some headroom.

## SUMSHODHINI workshop gallery photos

| Workshop | Year | Exact upload paths |
|---|---:|---|
| Agentic AI Workshop | 2025 | `src/assets/images/gallery/sumshodhini/agentic-ai-2025-1.webp`, `agentic-ai-2025-2.webp` |
| Mobile Application Development Workshop | 2024 | `src/assets/images/gallery/sumshodhini/mobile-app-development-2024-1.webp`, `mobile-app-development-2024-2.webp` |
| Ethical Hacking Workshop | 2023 | `src/assets/images/gallery/sumshodhini/ethical-hacking-2023-1.webp`, `ethical-hacking-2023-2.webp` |

Recommended gallery dimensions: 1600×1000 px or another consistent landscape ratio. Existing lightbox behavior is preserved.