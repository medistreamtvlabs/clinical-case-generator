# Render Build Troubleshooting Guide

## Build Error: "Cannot find module 'tailwindcss'"

### Problem
```
Error: Cannot find module 'tailwindcss'
Require stack:
- /opt/render/project/src/node_modules/next/dist/build/webpack/config/blocks/css/plugins.js
```

### Root Cause
Dependencies were not installed correctly during the build process.

### Solution

**Update your Build Command in Render Dashboard:**

From:
```
npm install && npx prisma generate && npm run build
```

To:
```
npm ci --legacy-peer-deps && npx prisma generate && npm run build
```

### Why This Works

- `npm ci` (Clean Install): More reliable than `npm install` for CI/CD environments
  - Uses package-lock.json for exact dependency versions
  - Fails faster if dependencies can't be resolved
  - Better for automated deployments

- `--legacy-peer-deps`: Allows installation of peer dependencies
  - Prevents conflicts between package versions
  - Necessary for some TypeScript/React combinations

### Steps to Fix

1. **Go to Render Dashboard**
2. **Select your Web Service** (clinical-case-generator)
3. **Go to Settings** tab
4. **Update Build Command** to:
   ```
   npm ci --legacy-peer-deps && npx prisma generate && npm run build
   ```
5. **Save Changes**
6. **Click "Manual Deploy"**
7. **Wait for build to complete** (3-5 minutes)
8. **Check Logs** for success

### Alternative Solutions if Build Still Fails

**Option 1: Increase Build Timeout**
- Some projects take longer to build
- Render usually allows 30 minutes for builds
- If timing out, consider upgrading plan

**Option 2: Check Node Version**
- Ensure Node.js 18+ is being used
- In render.yaml: runtimeVersion: 18 ✅

**Option 3: Clear Render Cache**
- Render → Service → Settings
- Scroll to "Clear Cache"
- Click "Clear All"
- Try deploying again

**Option 4: Verify package.json**
- Ensure package.json is valid JSON
- All dependencies are listed
- Dev dependencies include Tailwind: `"tailwindcss": "^3.4.10"` ✅

---

## Other Common Build Errors

### "Module not found: Can't resolve '@/config/constants'"

**Solution**: Path aliases in tsconfig.json may not be resolving
```bash
# Ensure ts config paths are correct:
"paths": {
  "@/*": ["./src/*"]
}
```

### "Module not found: Can't resolve '@/components/ui/card'"

**Solution**: UI components not found
- Verify components exist at `/src/components/ui/card.tsx`
- Check path aliases match

### Build timeout

**Solution**: 
- Upgrade to Pro plan for more build time
- Optimize package size
- Use `npm ci` instead of `npm install`

---

## Verification Checklist

Before redeploying, verify:

- [ ] Build command includes `npm ci --legacy-peer-deps`
- [ ] DATABASE_URL is set in environment
- [ ] ANTHROPIC_API_KEY is set
- [ ] Node version is 18+
- [ ] All files are committed to GitHub
- [ ] package.json is valid JSON
- [ ] No syntax errors in TypeScript

---

## Quick Reference

**Correct Build Command for Render:**
```
npm ci --legacy-peer-deps && npx prisma generate && npm run build
```

**Correct Start Command:**
```
npm start
```

**Pre-deploy Command (Optional):**
```
npx prisma db push --skip-generate
```

---

## Getting Help

1. **Check Render Logs**
   - Render Dashboard → Service → Logs
   - Shows exact build errors

2. **Review package.json**
   - Ensure all dependencies are listed
   - Check for syntax errors

3. **Test Locally**
   ```bash
   npm ci --legacy-peer-deps
   npm run build
   npm start
   ```

4. **Contact Render Support**
   - https://render.com/support
   - https://status.render.com

---

**Status**: Deployment configuration fixed ✅
**Next Step**: Manual Deploy in Render Dashboard
