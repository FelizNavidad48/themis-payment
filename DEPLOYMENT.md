# Deployment Guide

## Deploying Themis to Production

This guide covers deploying the Themis payment platform to various hosting providers.

## Prerequisites

Before deploying:

- [ ] All dependencies installed and working locally
- [ ] WalletConnect Project ID obtained
- [ ] Tested locally with `pnpm dev`
- [ ] No console errors
- [ ] Git repository set up

## Recommended: Vercel (Easiest)

Vercel is the recommended deployment platform for Next.js applications.

### Step 1: Prepare Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit: Themis payment platform"

# Push to GitHub
gh repo create themis-payment --public
git remote add origin https://github.com/YOUR_USERNAME/themis-payment.git
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Sign up/log in with GitHub
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
6. Add environment variable:
   - Key: `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
   - Value: Your WalletConnect Project ID
7. Click "Deploy"

#### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variable
vercel env add NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID

# Deploy to production
vercel --prod
```

### Step 3: Configure Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Click "Settings" > "Domains"
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate provisioning

## Alternative: Netlify

### Step 1: Build Configuration

Create `netlify.toml`:

```toml
[build]
  command = "pnpm build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Step 2: Deploy

#### Option A: Netlify Dashboard
1. Go to [netlify.com](https://netlify.com)
2. Sign up/log in
3. Click "Add new site" > "Import an existing project"
4. Connect to GitHub
5. Select repository
6. Configure:
   - Build command: `pnpm build`
   - Publish directory: `.next`
7. Add environment variable:
   - Key: `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID`
8. Click "Deploy"

#### Option B: Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod
```

## Alternative: Self-Hosted (VPS/Cloud)

For deployment on your own server (AWS, DigitalOcean, etc.)

### Requirements
- Node.js 18+
- pnpm
- Reverse proxy (Nginx/Apache)
- SSL certificate (Let's Encrypt)

### Step 1: Server Setup

```bash
# SSH into your server
ssh user@your-server.com

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm

# Clone repository
git clone https://github.com/YOUR_USERNAME/themis-payment.git
cd themis-payment

# Install dependencies
pnpm install

# Create .env.local
echo "NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_id" > .env.local

# Build
pnpm build
```

### Step 2: Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start npm --name "themis" -- start

# Enable startup on boot
pm2 startup
pm2 save
```

### Step 3: Nginx Configuration

Create `/etc/nginx/sites-available/themis`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/themis /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 4: SSL Certificate

```bash
# Install Certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Docker Deployment

### Dockerfile

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Dependencies
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  themis:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=${NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID}
    restart: unless-stopped
```

### Build and Run

```bash
# Build
docker-compose build

# Run
docker-compose up -d

# View logs
docker-compose logs -f
```

## Environment Variables

All deployment platforms need this environment variable:

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect Project ID | Yes | `a1b2c3d4e5f6...` |

## Post-Deployment Checklist

After deploying:

- [ ] Site loads correctly
- [ ] Wallet connection works
- [ ] Can create payment request
- [ ] Payment link works
- [ ] Can pay request
- [ ] Transaction confirms
- [ ] Polygonscan link works
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain (if applicable)

## Monitoring & Analytics

### Vercel Analytics

Already included if deployed on Vercel. View in dashboard.

### Google Analytics

Add to `app/layout.tsx`:

```typescript
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `}
        </Script>
      </head>
      <body>{children}</body>
    </html>
  );
}
```

### Error Tracking (Sentry)

```bash
pnpm add @sentry/nextjs
```

Initialize:
```bash
npx @sentry/wizard@latest -i nextjs
```

## Performance Optimization

### Enable Next.js Image Optimization

If using images, configure in `next.config.ts`:

```typescript
const nextConfig = {
  images: {
    domains: ['your-cdn.com'],
    formats: ['image/webp', 'image/avif'],
  },
};
```

### Enable Compression

Vercel/Netlify handle this automatically.

For self-hosted:
```nginx
# In nginx config
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
```

## Scaling Considerations

### CDN
- Vercel: Built-in CDN
- Netlify: Built-in CDN
- Self-hosted: CloudFlare, AWS CloudFront

### Load Balancing
For high traffic, consider:
- Multiple server instances
- Load balancer (Nginx, HAProxy)
- Database for transaction history (future feature)

### Caching
- Next.js automatic static optimization
- CDN caching for static assets
- Browser caching headers

## Security

### Headers

Add to `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

### Rate Limiting

For self-hosted, add to Nginx:

```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location / {
    limit_req zone=api burst=20;
    proxy_pass http://localhost:3000;
}
```

## Backup & Disaster Recovery

### Version Control
- Always push to GitHub
- Tag releases: `git tag v1.0.0`
- Keep production branch separate

### Database (Future)
When adding transaction history:
- Automated backups
- Point-in-time recovery
- Replica databases

## Troubleshooting

### Build Failures

**Issue**: "Module not found"
```bash
# Clear cache and reinstall
rm -rf node_modules .next
pnpm install
pnpm build
```

**Issue**: "Environment variable not defined"
- Check environment variable is set in platform
- Ensure it starts with `NEXT_PUBLIC_`
- Redeploy after adding

### Runtime Issues

**Issue**: "Wallet won't connect"
- Verify WalletConnect ID is correct
- Check it's set in production environment
- Verify it's not rate limited

**Issue**: "Site loads slowly"
- Enable CDN
- Check image optimization
- Review bundle size: `pnpm analyze`

### CORS Issues

Shouldn't occur with this architecture, but if needed:

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
        ],
      },
    ];
  },
};
```

## Costs

### Vercel
- Hobby (free): Perfect for MVP
  - Unlimited deployments
  - 100 GB bandwidth/month
  - Automatic HTTPS
- Pro ($20/month): For production
  - More bandwidth
  - Team features

### Netlify
- Starter (free): Good for MVP
  - 100 GB bandwidth/month
  - 300 build minutes/month
- Pro ($19/month): For growth

### Self-Hosted
- DigitalOcean Droplet: $5-10/month
- AWS EC2: $5-50/month depending on traffic
- Domain: $10-15/year
- SSL: Free with Let's Encrypt

## Next Steps

After deploying:

1. Share with users for feedback
2. Monitor analytics and errors
3. Iterate based on usage
4. Plan feature additions
5. Scale as needed

## Support

For deployment issues:
- Check platform documentation
- Review Next.js deployment docs
- Ask in Web3 developer communities
- Review GitHub issues

---

**Recommended**: Start with Vercel for simplicity, migrate to self-hosted only if needed for cost or control.
