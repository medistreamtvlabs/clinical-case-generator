# Clinical Case Generator - Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying the Clinical Case Generator to Render.com, a modern cloud platform for hosting web applications and databases.

**Deployment Target**: Render.com
**Framework**: Next.js 14
**Database**: PostgreSQL 15
**Runtime**: Node.js 18
**Status**: Production Ready ✅

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Render.com Setup](#rendercom-setup)
4. [Environment Configuration](#environment-configuration)
5. [Deployment Process](#deployment-process)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:

✅ **GitHub Account** - Repository already pushed to GitHub
✅ **Render Account** - Free or paid plan at https://render.com
✅ **Anthropic API Key** - Claude API key for backend services
✅ **Environment Configuration** - All required environment variables
✅ **Database** - PostgreSQL 15+ (Render provides this)

### Accounts Setup

1. **Create Render Account**
   - Visit https://render.com
   - Sign up with GitHub (recommended for easy integration)
   - Verify email

2. **Connect GitHub Repository**
   - In Render dashboard: Dashboard → Settings → GitHub
   - Authorize your GitHub account
   - Repository access will be automatic if public

---

## Pre-Deployment Checklist

Before deploying to production, verify:

```bash
# ✅ Run tests
npm run test:run

# ✅ Check code coverage
npm run test:coverage

# ✅ Build verification
npm run build

# ✅ Type checking
npm run type-check

# ✅ Linting
npm run lint

# ✅ Check git status
git status

# ✅ Verify all tests pass
npm run test:run -- --reporter=verbose
```

**Deployment Checklist**:
- [ ] All tests passing (259 tests)
- [ ] Code coverage at 80%+
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] All environment variables documented
- [ ] Database schema is up to date
- [ ] GitHub repository is public and up to date
- [ ] API keys are ready to configure
- [ ] Backup of current database (if migrating)

---

## Render.com Setup

### Step 1: Create PostgreSQL Database Service

1. Go to Render Dashboard
2. Click **New +** → **PostgreSQL**
3. Configure database:
   - **Name**: `clinical-case-db`
   - **Database Name**: `caso_clinico_db`
   - **User**: `postgres` (or custom)
   - **Region**: Select closest to your users (e.g., Oregon, Virginia)
   - **PostgreSQL Version**: 15
   - **Plan**: Standard ($15/month) or higher

4. Click **Create Database**
5. **Important**: Save the connection string displayed. You'll need it later.

### Step 2: Create Web Service

1. Go to Render Dashboard
2. Click **New +** → **Web Service**
3. Choose **Deploy from GitHub repository**
4. **Connect GitHub**:
   - Click **Connect Account**
   - Authorize GitHub
   - Select repository: `clinical-case-generator`

5. Configure Web Service:
   - **Name**: `clinical-case-generator`
   - **Environment**: `Node`
   - **Region**: Same as database (e.g., Oregon)
   - **Branch**: `main`
   - **Build Command**:
     ```
     npm install && npx prisma generate && npm run build
     ```
   - **Start Command**:
     ```
     npm start
     ```
   - **Plan**: Standard ($7/month) or higher

6. Click **Create Web Service**

### Step 3: Configure Environment Variables

In the Web Service settings:

1. Go to **Environment** tab
2. Add the following variables:

```env
# Environment
NODE_ENV=production

# Database (auto-populated if linked)
DATABASE_URL=postgresql://user:password@host:port/dbname

# Public App URL (gets filled automatically)
NEXT_PUBLIC_APP_URL=https://your-service.onrender.com

# API Keys
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxx

# File Storage
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760

# Feature Flags
ENABLE_ANALYTICS=false
ENABLE_EXPORT=true

# Logging
LOG_LEVEL=info
```

### Step 4: Link Database to Web Service

1. In Web Service → Environment
2. Click **Add Service** under Environment
3. Select your PostgreSQL database
4. The `DATABASE_URL` will auto-populate

---

## Environment Configuration

### Required Environment Variables

Create a `.env.production` file (for local testing) or set in Render dashboard:

```env
# DATABASE CONFIGURATION
DATABASE_URL="postgresql://postgres:PASSWORD@HOST:PORT/caso_clinico_db"

# ANTHROPIC API KEY
ANTHROPIC_API_KEY="sk-ant-xxxxxxxxxxxxx"

# APP CONFIGURATION
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-service.onrender.com"

# FILE STORAGE
UPLOAD_DIR="/tmp/uploads"
MAX_FILE_SIZE="10485760"

# LOGGING & FEATURES
LOG_LEVEL="info"
ENABLE_ANALYTICS="false"
ENABLE_EXPORT="true"
```

### How to Get Environment Variables

**ANTHROPIC_API_KEY**:
- Go to https://console.anthropic.com
- Create an API key
- Copy and paste into Render environment variables

**DATABASE_URL**:
- Created automatically when you link PostgreSQL
- Format: `postgresql://user:password@host:port/database`

---

## Deployment Process

### Option 1: Automatic Deployment (Recommended)

1. **Initial Setup**
   - Render automatically deploys on every push to `main` branch
   - View logs in Render dashboard: **Service → Logs**

2. **To Deploy**
   ```bash
   git push origin main
   ```
   - Render automatically builds and deploys
   - Deployment takes 3-5 minutes

3. **Monitor Deployment**
   - Render dashboard shows build status
   - Check **Logs** tab for build output
   - Check **Metrics** for performance

### Option 2: Manual Deployment

1. Go to Render Web Service dashboard
2. Click **Manual Deploy** button
3. Select branch: `main`
4. Click **Deploy**

### Deployment Steps

1. **Build Phase** (~2-3 minutes)
   - Pull repository
   - Install dependencies: `npm install`
   - Generate Prisma client: `npx prisma generate`
   - Build application: `npm run build`
   - Create optimized production bundle

2. **Database Migration** (~1 minute)
   - Run: `npx prisma db push`
   - Applies schema changes to database
   - Creates tables if needed

3. **Start Service** (~30 seconds)
   - Start Node.js server: `npm start`
   - Server runs on port 3000
   - Render assigns public URL

4. **Health Check** (~30 seconds)
   - Render pings application
   - Verifies service is running
   - Routes traffic if healthy

---

## Post-Deployment Verification

### Verify Deployment Success

1. **Check Service Status**
   - Go to Render dashboard
   - Service should show "Live" status
   - No errors in Logs

2. **Test Application**
   ```bash
   curl https://clinical-case-generator.onrender.com/
   ```
   - Should return HTML page
   - Status code: 200

3. **Check Database Connection**
   ```bash
   # Via Render console
   psql $DATABASE_URL
   \dt  # List all tables
   \q  # Quit
   ```

4. **Verify Database Schema**
   - Tables should exist: `ClinicalCase`, `Project`, `User`, `Document`, etc.
   - Indexes should be created
   - All migrations applied

5. **Test Application Features**
   - Navigate to https://clinical-case-generator.onrender.com
   - Login/register if applicable
   - Create a test case
   - Verify validation service works
   - Test export functionality
   - Check file uploads work

### Monitor Initial Performance

1. **Metrics Dashboard**
   - Render → Service → Metrics
   - CPU Usage: Should be < 80%
   - Memory: Should be < 500MB
   - Logs: Check for errors/warnings

2. **Response Times**
   - Normal API response: < 200ms
   - Page load: < 2 seconds
   - File upload: Varies by size

---

## Monitoring & Maintenance

### Daily Monitoring

**Check service health**:
1. Visit dashboard: https://clinical-case-generator.onrender.com
2. Monitor error logs: Render → Logs
3. Check metrics: Render → Metrics

**Log Levels**:
- `error` - Critical issues requiring attention
- `warn` - Warnings about potential problems
- `info` - General information (default)
- `debug` - Detailed debugging information

### Weekly Tasks

- [ ] Review error logs
- [ ] Check database size and growth
- [ ] Verify API response times
- [ ] Test critical user workflows
- [ ] Review backup status

### Monthly Tasks

- [ ] Full application test
- [ ] Database maintenance/optimization
- [ ] Performance review
- [ ] Security audit
- [ ] Documentation update

### Database Backups

Render automatically backs up PostgreSQL databases. To manually backup:

```bash
# Download backup
pg_dump $DATABASE_URL > backup.sql

# Restore backup
psql $DATABASE_URL < backup.sql
```

### Updating Application

1. **Make changes locally**
   ```bash
   git add .
   git commit -m "Update feature/fix bug"
   ```

2. **Push to GitHub**
   ```bash
   git push origin main
   ```

3. **Render auto-deploys**
   - Automatic deployment triggers
   - Monitor in Render dashboard
   - Deployment complete in 3-5 minutes

---

## Troubleshooting

### Build Failures

**Error: "npm install failed"**
- Check `package.json` syntax
- Verify all dependencies are compatible
- Try: `npm ci` instead of `npm install`

**Error: "Build command timed out"**
- May need to upgrade plan
- Check for large dependencies
- Run `npm audit` for security issues

### Deployment Issues

**Error: "DATABASE_URL not set"**
- Go to Environment variables
- Verify DATABASE_URL is set
- Re-deploy after adding variable

**Error: "Prisma migration failed"**
```bash
# Run locally to diagnose
npm run prisma:migrate

# Then push fix to GitHub
git push origin main
```

### Runtime Issues

**Error: "Application crashed"**
- Check logs: Render → Logs
- Look for error messages
- Check environment variables are correct
- Verify database connection

**High memory usage**
- Check for memory leaks
- Upgrade to higher plan
- Review Metrics tab

**Slow performance**
- Check database query performance
- Review API response times
- Consider caching strategies
- Upgrade to better plan

### Database Issues

**Cannot connect to database**
```bash
# Test connection
psql $DATABASE_URL

# If fails, check:
# 1. DATABASE_URL format
# 2. Firewall settings in Render
# 3. Database service is running
```

**Disk space full**
- Render alerts when approaching limit
- Consider upgrading database plan
- Clean up old files/records
- Archive old data

---

## Rollback Procedure

If deployment has issues:

1. **Identify Problem**
   - Check Logs tab
   - Note error messages
   - Determine if from code or environment

2. **Rollback Options**

   **Option A: Revert Code**
   ```bash
   git revert <commit-hash>
   git push origin main
   # Render auto-deploys previous version
   ```

   **Option B: Manual Deployment**
   - Go to Render dashboard
   - Click **Manual Deploy**
   - Select earlier commit
   - Click Deploy

3. **Verify Rollback**
   - Check service status
   - Verify application works
   - Check logs for errors

---

## Performance Optimization

### Caching Strategy

```env
# Add caching headers
CACHE_MAX_AGE=3600  # 1 hour
CACHE_REVALIDATE=1800  # 30 minutes
```

### Database Optimization

```bash
# Analyze query performance
EXPLAIN ANALYZE SELECT * FROM "ClinicalCase" WHERE status = 'PUBLISHED';

# Create indexes (already in schema)
CREATE INDEX idx_case_status ON "ClinicalCase"(status);
```

### Static File Compression

Next.js automatically compresses static files. Verify in response headers:
```
Content-Encoding: gzip
```

---

## Security Checklist

- [ ] HTTPS enabled (Render provides free SSL)
- [ ] Environment variables not in repository
- [ ] API keys rotated regularly
- [ ] Database backups verified
- [ ] Access logs reviewed monthly
- [ ] Prisma client updated
- [ ] Dependencies audited: `npm audit`
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Input validation enabled

---

## Cost Estimation

**Monthly Costs (Approximate)**:
- Web Service (Standard): $7
- PostgreSQL Database (Standard): $15
- Total: ~$22/month

**Scaling to Production**:
- Web Service (Pro): $25/month
- PostgreSQL Database (Pro): $50/month
- Total: ~$75/month

Prices subject to change. See https://render.com/pricing

---

## Support & Resources

**Helpful Links**:
- Render Docs: https://render.com/docs
- Next.js Deployment: https://nextjs.org/docs/deployment
- Prisma Documentation: https://www.prisma.io/docs
- PostgreSQL Manual: https://www.postgresql.org/docs

**Getting Help**:
1. Check Render status page
2. Review application logs
3. Contact Render support
4. Check Next.js documentation
5. Review Prisma docs

---

## Frequently Asked Questions

**Q: How long does deployment take?**
A: 3-5 minutes typically. First deployment may take longer.

**Q: Can I use a custom domain?**
A: Yes! Add custom domain in Render dashboard (requires DNS configuration).

**Q: How do I view logs?**
A: Render dashboard → Web Service → Logs tab shows real-time logs.

**Q: Can I scale the application?**
A: Yes, upgrade to Pro plan or higher for more resources.

**Q: How do I backup the database?**
A: Render automatically backs up. Manual backups via `pg_dump`.

**Q: Can I run cron jobs?**
A: On paid plans, yes. Use Render Cron Jobs feature.

---

## Conclusion

Your Clinical Case Generator is now deployed and production-ready! Monitor the Render dashboard regularly and follow the maintenance procedures to keep the application running smoothly.

For questions or issues, refer to the troubleshooting section or contact Render support.

**Last Updated**: 2024-02-18
**Version**: 1.0.0
**Status**: Production Ready ✅
