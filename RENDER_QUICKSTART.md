# Render Deployment - Quick Start (5 Minutes)

## The Fastest Way to Deploy to Render.com

### Step 1: Sign Up (2 minutes)
```
1. Go to https://render.com
2. Click "Sign up"
3. Sign up with GitHub (recommended)
4. Verify email
```

### Step 2: Create PostgreSQL Database (1 minute)
```
1. In Render Dashboard: New + → PostgreSQL
2. Name: clinical-case-db
3. Click Create Database
4. Save the connection string (you'll see it on the dashboard)
```

### Step 3: Create Web Service (2 minutes)
```
1. Dashboard: New + → Web Service
2. Connect GitHub → clinical-case-generator
3. Settings:
   - Name: clinical-case-generator
   - Environment: Node
   - Region: Oregon (or closest to you)
   - Build Command:
     npm install --legacy-peer-deps && npx prisma generate && npm run build
   - Start Command:
     npm start
   - Plan: Standard
4. Click Create Web Service
```

### Step 4: Configure Environment Variables (30 seconds)
In Web Service → Environment, add:

```
NODE_ENV = production
ANTHROPIC_API_KEY = sk-ant-xxxxx (get from https://console.anthropic.com)
NEXT_PUBLIC_APP_URL = https://clinical-case-generator.onrender.com
UPLOAD_DIR = /tmp/uploads
MAX_FILE_SIZE = 10485760
ENABLE_EXPORT = true
LOG_LEVEL = info
```

Then link your PostgreSQL database:
- Click "Add Service"
- Select clinical-case-db
- DATABASE_URL auto-populates ✅

### Step 5: Deploy (Automatic!)
```
git push origin main
```

Render automatically deploys in 3-5 minutes. Check the build logs:
- Render Dashboard → Service → Logs

---

## ✅ Done! Your App is Live

Visit: **https://clinical-case-generator.onrender.com**

---

## Next Steps

1. **Set your Anthropic API Key**
   - Get key from https://console.anthropic.com
   - Add to Render environment variables
   - Re-deploy: click Manual Deploy

2. **Test the Application**
   - Create a project
   - Generate a case
   - Validate and export

3. **Monitor Performance**
   - Check Render Metrics tab
   - Review logs regularly
   - Watch for errors

4. **Set Up Custom Domain** (Optional)
   - Buy domain (e.g., GoDaddy, Namecheap)
   - Add custom domain in Render
   - Configure DNS records
   - Enable free SSL

---

## Troubleshooting

**Build fails?**
- Check logs: Render → Logs
- Verify environment variables
- Run locally: `npm install --legacy-peer-deps && npm run build`

**App crashes?**
- Check DATABASE_URL is correct
- Verify ANTHROPIC_API_KEY is set
- Check logs for error messages

**Database not connecting?**
- Verify DATABASE_URL in environment
- Check database service is running
- Try: psql $DATABASE_URL

---

## Cost

- **Web Service**: $7/month
- **PostgreSQL**: $15/month
- **Total**: ~$22/month

Free tier available for testing!

---

## Full Documentation

See **DEPLOYMENT.md** for complete deployment guide with:
- Advanced configuration
- Monitoring & maintenance
- Troubleshooting
- Security checklist
- Cost optimization

---

**Deployment Status**: ✅ Production Ready

Your Clinical Case Generator is now live on Render!
