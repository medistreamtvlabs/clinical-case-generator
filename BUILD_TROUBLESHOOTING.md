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

**The Issue with npm ci:**
- Our `.gitignore` excludes `package-lock.json`
- `npm ci` requires `package-lock.json` to work
- When package-lock.json is missing, `npm ci` fails silently
- Result: Dependencies don't install → Build fails

### Solution

**Update your Build Command in Render Dashboard:**

From:
```
npm ci --legacy-peer-deps && npx prisma generate && npm run build
```

To:
```
npm install --legacy-peer-deps && npx prisma generate && npm run build
```

### Why This Works

`npm install --legacy-peer-deps`:
- Generates package-lock.json on first run
- Works even without a pre-existing lock file
- `--legacy-peer-deps` allows peer dependency resolution
- Better for CI/CD when lock file isn't committed

### Steps to Fix

1. **Go to Render Dashboard** → https://dashboard.render.com
2. **Select your Web Service** (clinical-case-generator)
3. **Go to Settings** tab
4. **Update Build Command** to:
   ```
   npm install --legacy-peer-deps && npx prisma generate && npm run build
   ```
5. **Save Changes**
6. **Click "Manual Deploy"**
7. **Wait for build to complete** (3-5 minutes)
8. **Check Logs** for success

### Alternative Solutions if Build Still Fails

**Option 1: Commit package-lock.json**
- Remove `package-lock.json` from `.gitignore`
- Run `npm install` locally to generate it
- Commit to GitHub
- Use `npm ci --legacy-peer-deps` in Render

**Option 2: Use npm ci with fallback**
```
npm ci --legacy-peer-deps || npm install --legacy-peer-deps
```

**Option 3: Increase Build Timeout**
- Some projects take longer to build
- Render usually allows 30 minutes for builds
- If timing out, consider upgrading plan

**Option 4: Clear Render Cache**
- Render → Service → Settings
- Scroll to "Clear Cache"
- Click "Clear All"
- Try deploying again

**Option 5: Verify Node Version**
- Ensure Node.js 18+ is being used
- In render.yaml: runtimeVersion: 18 ✅

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
- Ensure all imports use correct paths

### Build timeout

**Solution**: 
- Upgrade to Pro plan for more build time
- Optimize package size
- Use `npm install` with `--legacy-peer-deps`

### "Requested and resolved page mismatch"

**Solution**: Duplicate API routes with malformed names
- Check for files with escaped brackets: `\[projectId\]`
- Should be: `[projectId]` (without backslashes)
- Remove any malformed duplicate directories

---

## Verification Checklist

Before redeploying, verify:

- [ ] Build command: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
- [ ] DATABASE_URL is set in environment
- [ ] ANTHROPIC_API_KEY is set
- [ ] Node version is 18+
- [ ] All files are committed to GitHub
- [ ] package.json is valid JSON
- [ ] No syntax errors in TypeScript
- [ ] No duplicate API route directories

---

## Quick Reference

**Correct Build Command for Render:**
```
npm install --legacy-peer-deps && npx prisma generate && npm run build
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

## Why npm install vs npm ci?

| Aspect | npm install | npm ci |
|--------|-------------|--------|
| Lock file required | No | Yes |
| Generates lock file | Yes | No |
| Best for | Development | CI/CD |
| When to use | When package-lock.json is in .gitignore | When package-lock.json is committed |

**Our project:** Uses `npm install` because `package-lock.json` is in `.gitignore`

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
   npm install --legacy-peer-deps
   npm run build
   npm start
   ```

4. **Contact Render Support**
   - https://render.com/support
   - https://status.render.com

---

**Status**: Deployment configuration fixed ✅
**Next Step**: Manual Deploy in Render Dashboard with corrected build command
