# Deployment Documentation - File Guide

This directory now contains comprehensive deployment documentation for Render.com. Here's a quick guide to which file to use for different purposes.

---

## 📚 Documentation Files Overview

### 1. **RENDER_QUICKSTART.md** ⭐ START HERE
**Purpose**: Quick 5-minute deployment guide for first-time setup

**When to use**:
- You're deploying for the first time
- You need a quick overview
- You want step-by-step instructions without deep technical details

**Covers**:
- Sign up on Render
- Create PostgreSQL database
- Create web service
- Configure environment variables
- Deploy and verify

**Read time**: ~5 minutes

---

### 2. **RENDER_DEPLOYMENT_FIX.md** ⭐ USE THIS WHEN BUILD FAILS
**Purpose**: Detailed guide for fixing build command and configuration issues

**When to use**:
- Build is failing in Render
- Render is using an old/cached build command
- You need to update build command manually in dashboard
- You want to understand why Render configuration issues occur

**Covers**:
- Problem identification (what went wrong)
- Solution Method 1: Update via dashboard (recommended)
- Solution Method 2: Delete & recreate service
- Root cause analysis
- Testing and verification
- Next steps after successful deployment

**Read time**: ~10 minutes

---

### 3. **DEPLOYMENT.md** 📖 COMPLETE REFERENCE
**Purpose**: Comprehensive deployment reference with all details

**When to use**:
- You need complete information about deployment
- You're monitoring production
- You're troubleshooting complex issues
- You need security checklist
- You're optimizing performance
- You need rollback procedures

**Covers**:
- Prerequisites and account setup
- Pre-deployment checklist (259 tests verification)
- Step-by-step Render setup
- Environment variable configuration
- Deployment process
- Post-deployment verification
- Monitoring and maintenance
- Troubleshooting guide (build, deployment, runtime, database issues)
- Rollback procedures
- Performance optimization
- Security checklist
- Cost estimation
- FAQs

**Read time**: ~20-30 minutes

---

### 4. **BUILD_TROUBLESHOOTING.md** 🔧 FOR BUILD ISSUES
**Purpose**: Deep dive into npm install vs npm ci issues and solutions

**When to use**:
- You're getting "Cannot find module" errors
- You want to understand npm dependency installation
- You need to fix package-lock.json issues
- You're debugging build failures

**Covers**:
- Problem description
- Root cause analysis (npm ci vs npm install)
- Why .gitignore matters
- When to use each command
- Solution explanation
- Prevention strategies

**Read time**: ~10 minutes

---

### 5. **render.yaml** ⚙️ INFRASTRUCTURE AS CODE
**Purpose**: Render infrastructure configuration file

**When to use**:
- You want to see infrastructure definition
- You're checking build/start commands
- You're verifying environment variables
- You're using Infrastructure as Code approach

**Contains**:
- PostgreSQL database configuration
- Web service configuration
- Build and start commands
- Environment variables definition
- Auto-deploy settings from GitHub
- Health check configuration

---

## 🚀 Quick Decision Tree

```
I want to...

├─ Deploy for the first time
│  └─ Read: RENDER_QUICKSTART.md
│
├─ Fix a build error
│  ├─ Read: RENDER_DEPLOYMENT_FIX.md (Method 1)
│  ├─ Read: BUILD_TROUBLESHOOTING.md (for npm issues)
│  └─ Reference: DEPLOYMENT.md (Troubleshooting section)
│
├─ Understand complete deployment details
│  └─ Read: DEPLOYMENT.md
│
├─ Monitor production deployment
│  ├─ Check: Render Dashboard Metrics tab
│  └─ Reference: DEPLOYMENT.md (Monitoring & Maintenance section)
│
├─ Troubleshoot database issues
│  └─ Reference: DEPLOYMENT.md (Database Issues section)
│
├─ Understand infrastructure config
│  ├─ Read: render.yaml
│  └─ Reference: DEPLOYMENT.md (Environment Configuration section)
│
└─ Configure custom domain
   └─ Reference: DEPLOYMENT.md (Set Up Custom Domain section)
```

---

## 🔐 Critical Environment Variables

Before deployment, ensure these are configured in Render Dashboard:

| Variable | Value | Status |
|----------|-------|--------|
| `NODE_ENV` | `production` | ✅ Set in render.yaml |
| `DATABASE_URL` | Auto-populated | ✅ Auto-linked to PostgreSQL |
| `ANTHROPIC_API_KEY` | From console.anthropic.com | ⚠️ **MUST SET MANUALLY** |
| `NEXT_PUBLIC_APP_URL` | Auto-populated from service URL | ✅ Auto-linked to web service |
| `UPLOAD_DIR` | `/tmp/uploads` | ✅ Set in render.yaml |
| `MAX_FILE_SIZE` | `10485760` | ✅ Set in render.yaml |
| `ENABLE_EXPORT` | `true` | ✅ Set in render.yaml |
| `LOG_LEVEL` | `info` | ✅ Set in render.yaml |

**⚠️ IMPORTANT**: The ANTHROPIC_API_KEY is not in render.yaml (for security). You must manually add it to Render Dashboard:
1. Go to Render Dashboard → Web Service → Environment
2. Click "Add Environment Variable"
3. Key: `ANTHROPIC_API_KEY`
4. Value: Get from https://console.anthropic.com (your API key)
5. Save and trigger Manual Deploy

---

## 📋 Deployment Checklist

### Before You Deploy
- [ ] All code committed and pushed to GitHub main branch
- [ ] Tests passing locally: `npm run test:run`
- [ ] Build succeeds locally: `npm run build`
- [ ] Environment variables documented in `.env.example`
- [ ] Anthropic API key obtained from https://console.anthropic.com

### During Deployment
- [ ] Created Render account at https://render.com
- [ ] PostgreSQL service created: `clinical-case-db`
- [ ] Web service created: `clinical-case-generator`
- [ ] GitHub connected and authorized
- [ ] Build command verified: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
- [ ] Start command verified: `npm start`
- [ ] Database linked to web service
- [ ] Environment variables configured
- [ ] Manual deploy triggered

### After Deployment
- [ ] Service status shows "Live" (✅ green)
- [ ] Build logs show successful completion
- [ ] No errors in runtime logs
- [ ] Application loads at https://clinical-case-generator.onrender.com
- [ ] Database connection established
- [ ] API responding to requests
- [ ] ANTHROPIC_API_KEY configured and working

---

## 📞 When Something Goes Wrong

**Problem**: Build fails
→ Read `RENDER_DEPLOYMENT_FIX.md` → Method 1 or Method 2

**Problem**: "Cannot find module 'tailwindcss'"
→ Read `BUILD_TROUBLESHOOTING.md` → npm install vs npm ci section

**Problem**: Database not connecting
→ Read `DEPLOYMENT.md` → Database Issues section

**Problem**: Need complete troubleshooting guide
→ Read `DEPLOYMENT.md` → Troubleshooting section

**Problem**: Want to understand infrastructure
→ Read `render.yaml` and `DEPLOYMENT.md` → Environment Configuration section

---

## 📊 Deployment Timeline

| Phase | Duration | Action |
|-------|----------|--------|
| Setup | 5 min | Sign up, create database, create web service |
| Configuration | 5 min | Add environment variables, link database |
| Build | 3-5 min | npm install, prisma generate, npm build |
| Deploy | 1 min | Start service, health check |
| Verification | 5 min | Test app, verify database, check logs |
| **Total** | **~20-25 min** | Full deployment process |

---

## 🎯 Current Deployment Status

**Latest Update**: 2026-02-18

**Repository**: https://github.com/medistreamtvlabs/clinical-case-generator

**Branch**: main (auto-deploy enabled)

**Latest Commits**:
- `efb8930` - Fix: Use npm install instead of npm ci due to .gitignore
- `84673fb` - Fix: Render build dependencies and create troubleshooting guide
- `0084be2` - Fix: Remove malformed API route directory with escaped brackets
- `b0a3d5a` - Add Render.com deployment configuration and guides

**Current Issue**: Build command may need manual update in Render Dashboard

**Next Action**: Follow `RENDER_DEPLOYMENT_FIX.md` → Method 1 to update build command

---

## 🔍 File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `RENDER_QUICKSTART.md` | ~140 | 5-minute deployment guide |
| `RENDER_DEPLOYMENT_FIX.md` | ~280 | Build command fix guide |
| `DEPLOYMENT.md` | ~600 | Complete deployment reference |
| `BUILD_TROUBLESHOOTING.md` | ~120 | npm install/ci explanation |
| `render.yaml` | ~73 | Infrastructure as code |
| `.env.example` | ~20 | Environment variables template |

**Total Documentation**: ~1,200 lines covering all deployment scenarios

---

## 💡 Pro Tips

1. **Always read RENDER_QUICKSTART.md first** - It gives you the overview
2. **Bookmark Render Dashboard** - You'll be there frequently: https://dashboard.render.com
3. **Check Logs frequently** - Most issues are visible in Render Logs tab
4. **Keep API key secure** - Don't commit it to git, only add via Render Dashboard
5. **Use Manual Deploy for testing** - Faster than pushing to GitHub for small changes
6. **Monitor metrics regularly** - Catch performance issues before users do

---

**Questions or Issues?**
1. Check the appropriate guide above
2. Review Render Status: https://status.render.com
3. Check application logs in Render Dashboard
4. Review GitHub commits for recent changes

**Happy Deploying! 🚀**
