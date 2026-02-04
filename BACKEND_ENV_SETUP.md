# Backend Environment Variables Setup

## Required Environment Variables for Elastic Beanstalk

Run these commands from your backend directory (where `.elasticbeanstalk` folder exists):

```bash
# CORS Configuration (CRITICAL - This is what's missing!)
eb setenv CORS_ALLOWED_ORIGINS="https://manovatecrm.netlify.app,http://localhost:5173,http://localhost:3000,https://crm-backend-prod.eba-u6tu4mfm.us-west-2.elasticbeanstalk.com"

# Database (already configured ✓)
eb setenv DATABASE_URL="postgresql://neondb_owner:npg_jpRUQmWCz29J@ep-morning-river-ahfsfci8-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Security (already configured ✓)
eb setenv SECRET_KEY="4u3yk(fd$&99r*z*b3gcku2*^w&e2lvhf4ebla&6"
eb setenv DEBUG="False"

# Hosts (already configured ✓)
eb setenv ALLOWED_HOSTS="crmbackend-xg8.onrender.com,manovatecrm.netlify.app,crm-backend-prod.eba-u6tu4mfm.us-west-2.elasticbeanstalk.com,*.elasticbeanstalk.com"

# Google OAuth (already configured ✓)
eb setenv GOOGLE_CLIENT_ID="407408718192.apps.googleusercontent.com"
```

## Verify Configuration

```bash
# Check all environment variables
eb printenv

# Should see:
# CORS_ALLOWED_ORIGINS = https://manovatecrm.netlify.app,http://localhost:5173,...
```

## Deploy Changes

After setting the environment variable, restart your backend:

```bash
# Option 1: Restart the environment
eb deploy

# Option 2: Just restart without redeploying
aws elasticbeanstalk restart-app-server --environment-name [your-env-name]
```

## Why This Fixes the Issue

**Problem:** Backend was returning `Access-Control-Allow-Origin: http://localhost:3000` 

**Root Cause:** Missing `CORS_ALLOWED_ORIGINS` environment variable, so Django used hardcoded defaults

**Solution:** Set `CORS_ALLOWED_ORIGINS` in Elastic Beanstalk to include your Netlify domain

## Test After Fix

1. Wait 2-3 minutes for the backend to restart
2. Open browser DevTools Network tab
3. Login from your Netlify app: https://manovatecrm.netlify.app
4. Check the login response headers - should now show:
   ```
   Access-Control-Allow-Origin: https://manovatecrm.netlify.app
   ```
