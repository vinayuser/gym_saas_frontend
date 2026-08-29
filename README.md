# Gym SaaS Frontend

React + Vite owner portal and marketing site for FitSphere Pro.

## Production (Oracle VM)

Deploys on push to `main` via GitHub Actions.

| Secret | Example |
|--------|---------|
| `ORACLE_HOST` | VM public IP |
| `ORACLE_USER` | `ubuntu` |
| `ORACLE_SSH_KEY` | SSH private key |
| `ORACLE_APP_HOME` | `/opt/gym-saas-frontend` |
| `VITE_BASE_PATH` | `/fitsphere/` |
| `VITE_API_BASE_URL` | `https://medisewa.in/fitsphere/api/v1` |
| `VITE_SOCKET_URL` | `https://medisewa.in/fitsphere` |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key |

Demo URL: `https://medisewa.in/fitsphere/` (HTTPS via medisewa nginx)

Alternate direct URL (requires Oracle VCN port 8090 open): `http://<ORACLE_HOST>:8090`
