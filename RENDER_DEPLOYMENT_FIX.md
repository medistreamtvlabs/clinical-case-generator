# Render Deployment - Build Command Fix Guide

## Problem Identified

**Current Issue**: Render Dashboard shows old build command being executed, even though `render.yaml` has been updated with the correct command.

**Symptoms**:
- Render logs show: `npm install &&` (without `--legacy-peer-deps`)
- Error: "Cannot find module 'tailwindcss'"
- But `render.yaml` clearly specifies: `npm install --legacy-peer-deps && npx prisma generate && npm run build`

**Root Cause**: Render may be using a cached configuration or hasn't synced the latest `render.yaml` from GitHub yet.

---

## Solution: Manual Configuration in Render Dashboard

### Method 1: Update Build Command Directly (RECOMMENDED - 5 minutes)

This is the most reliable way to ensure the build command is correct.

**Step-by-Step**:

1. **Go to Render Dashboard**
   - URL: https://dashboard.render.com
   - Login with your account
   - Select the `clinical-case-generator` web service

2. **Navigate to Settings**
   - Click **Settings** tab at the top
   - Scroll down to **Build Command**

3. **Update Build Command**
   - **Current (likely showing)**: `npm install && npx prisma generate && npm run build`
   - **Change to**: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
   - **Click**: Save Changes

4. **Verify Database Link**
   - Still in Settings, scroll to **Environment**
   - Verify `clinical-case-db` PostgreSQL service is linked
   - Confirm `DATABASE_URL` is present

5. **Deploy**
   - Click **Manual Deploy** button (top right)
   - Select branch: `main`
   - Click **Deploy**
   - Monitor the build in the **Logs** tab

6. **Expected Timeline**
   - Build starts: ~30 seconds
   - Build completes: ~3-5 minutes
   - Service becomes "Live": ~30 seconds after build

**Success Indicator**:
- Logs show: `npm install --legacy-peer-deps &&`
- Build completes without "Cannot find module" errors
- Service status shows ✅ "Live"

---

### Method 2: Delete & Recreate Service (If Method 1 Fails)

If Render still uses old config, fully recreate the service:

1. **Back Up Current Status**
   - Note the current DATABASE_URL from Environment tab
   - Screenshot environment variables
   - Note web service URL for DNS if using custom domain

2. **Delete Web Service**
   - Settings → Danger Zone → Delete Service
   - Type the service name to confirm
   - **Warning**: This will briefly take the site offline
   - The PostgreSQL database will NOT be deleted

3. **Recreate Web Service**
   - Dashboard → New + → Web Service
   - Connect GitHub repository: `medistreamtvlabs/clinical-case-generator`
   - **Settings**:
     - Name: `clinical-case-generator`
     - Environment: Node
     - Region: Oregon (same as database)
     - Build Command: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
     - Start Command: `npm start`

4. **Link Database**
   - Environment → Add Service
   - Select `clinical-case-db`
   - DATABASE_URL auto-populates

5. **Add API Key**
   - Environment → Add Environment Variable
   - Key: `ANTHROPIC_API_KEY`
   - Value: Your API key from https://console.anthropic.com
   - Save

6. **Deploy**
   - Click Create Web Service
   - Monitor logs for success

---

## Why This Happens (Technical Explanation)

### render.yaml vs Manual Configuration

**How Render Handles Infrastructure**:

1. **Infrastructure as Code** (`render.yaml`):
   - Render reads `render.yaml` from GitHub
   - Applies configuration when service is first created
   - Updates may require service recreation or manual sync

2. **Dashboard Configuration**:
   - Overrides `render.yaml` settings
   - Takes immediate effect
   - Stored in Render's database, not in git

3. **Cache & Sync Issues**:
   - Render may cache old configuration
   - GitHub → Render sync can be delayed
   - Manual config ensures immediate update

### Recommendation

For small changes like build commands, **use Method 1** (update in dashboard) for immediate effect.

For full infrastructure changes, **update `render.yaml`** and commit to git, but also verify the dashboard has the latest values.

---

## Verification Checklist

After applying fix, verify:

- [ ] Render Dashboard shows correct Build Command
- [ ] Logs show build starting with `npm install --legacy-peer-deps`
- [ ] Build succeeds within 5 minutes
- [ ] Service status shows ✅ Live
- [ ] Can access https://clinical-case-generator.onrender.com
- [ ] Application loads without 500 errors
- [ ] Database connection works (check logs for DB connection messages)

---

## Testing the Deployment

Once deployment succeeds, test core functionality:

```bash
# 1. Test API is responding
curl https://clinical-case-generator.onrender.com/

# 2. Should return HTML (not error)
# Expected: HTTP 200 with <!DOCTYPE html>

# 3. Test database connectivity
# Check Render Logs tab for any database connection errors
# Should see: "Connected to PostgreSQL"

# 4. In browser:
# - Navigate to https://clinical-case-generator.onrender.com
# - Check browser console for errors (F12 → Console)
# - Try creating a new project or case if UI loads
```

---

## If Build Still Fails

**Check these in order**:

1. **Verify Environment Variables**
   - `NODE_ENV` = `production`
   - `ANTHROPIC_API_KEY` = valid key (required!)
   - `DATABASE_URL` = populated automatically from linked service
   - `NEXT_PUBLIC_APP_URL` = `https://clinical-case-generator.onrender.com`

2. **Check Package.json**
   - Verify `tailwindcss` is in dependencies: `grep "tailwindcss" package.json`
   - Should exist: `"tailwindcss": "^3.3.0"` or similar

3. **Verify No Syntax Errors**
   - Build locally: `npm install --legacy-peer-deps && npm run build`
   - If it succeeds locally, issue is likely environment-specific

4. **Check Render Node Version**
   - Dashboard → Settings → Node Version
   - Should be 18 or higher
   - Current: 18 (as per render.yaml)

5. **Review Recent Git Commits**
   - Ensure latest code was pushed to `main` branch
   - Check: `git log -1` shows correct commit
   - Verify: `git push origin main` shows "Everything up-to-date"

---

## Expected Render Architecture

After successful deployment, you'll have:

```
┌─────────────────────────────────────────┐
│   Render.com Dashboard                  │
├─────────────────────────────────────────┤
│                                         │
│  ✅ Web Service                         │
│  ├─ Name: clinical-case-generator      │
│  ├─ Status: Live                       │
│  ├─ URL: https://...onrender.com       │
│  ├─ Runtime: Node 18                   │
│  ├─ Build: npm install --legacy...     │
│  └─ Logs: Build successful             │
│                                         │
│  ✅ PostgreSQL Database                │
│  ├─ Name: clinical-case-db            │
│  ├─ Status: Available                  │
│  ├─ Version: PostgreSQL 15             │
│  ├─ Region: Oregon                     │
│  └─ Backups: Automatic                 │
│                                         │
└─────────────────────────────────────────┘
```

---

## Next Steps After Successful Deployment

1. **Configure Anthropic API Key** ⚠️ CRITICAL
   - This is required for the application to function
   - Get key from: https://console.anthropic.com
   - Add to Render → Environment → `ANTHROPIC_API_KEY`
   - Trigger Manual Deploy after adding key

2. **Test Application Features**
   - Create a test project
   - Generate a clinical case
   - Run validation
   - Test export functionality

3. **Monitor Performance**
   - Check Render Metrics tab regularly
   - Review logs for errors
   - Watch CPU and memory usage

4. **Set Up Custom Domain** (Optional)
   - Purchase domain from registrar
   - Add to Render → Settings → Custom Domain
   - Configure DNS records
   - Enable free SSL certificate

5. **Database Backups** (Automatic)
   - Render automatically backs up PostgreSQL
   - Manual backup: `pg_dump $DATABASE_URL > backup.sql`
   - Restore: `psql $DATABASE_URL < backup.sql`

---

## Support Resources

- **Render Status**: https://status.render.com
- **Render Docs**: https://render.com/docs
- **GitHub Repo**: https://github.com/medistreamtvlabs/clinical-case-generator
- **Build Error Details**: Check Render Logs tab for full error messages

---

**Last Updated**: 2026-02-18
**Status**: Deployment guide for build command fix
**Author**: Claude + Clinical Case Generator Team
