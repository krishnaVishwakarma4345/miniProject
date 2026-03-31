# Deployment Playbook

## 1. Prerequisites
- Node.js 18.x
- Vercel CLI `npm i -g vercel`
- Firebase CLI `npm i -g firebase-tools`
- Service account with access to Firestore rules/indexes
- Environment variables configured in `.env` and on Vercel (Firebase keys, Cloudinary, etc.)

## 2. Local Smoke Test
```bash
npm ci
npm run lint
npm run test
npm run build
npm run start
```

## 3. Deploy to Vercel
```bash
vercel login
vercel link --project smart-student-hub
vercel env pull .env.production
vercel deploy --prebuilt --prod
```

## 4. Deploy Firestore Security Artifacts
```bash
firebase login
firebase use smart-student-hub-prod
firebase deploy --only firestore:rules,firestore:indexes
```

## 5. GitHub Actions Secrets
| Secret | Purpose |
| --- | --- |
| `VERCEL_TOKEN` | Authenticates deploy step |
| `VERCEL_ORG_ID` | Maps to Vercel organization |
| `VERCEL_PROJECT_ID` | Maps to Vercel project |
| `FIREBASE_TOKEN` | Deploys Firestore rules/indexes |

## 6. Rollback Plan
- Vercel: open dashboard → Deployments → promote previous build
- Firestore rules: `firebase deploy --only firestore:rules --force --debug` with prior commit

## 7. Monitoring Checklist
- Vercel analytics (latency, cold starts)
- Firebase console (Firestore read/write errors)
- Sentry/New Relic (client + server exceptions)
- GA4 funnel for onboarding
