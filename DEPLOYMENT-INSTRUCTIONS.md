# 🚀 AWS Amplify Deployment Guide

## Complete Step-by-Step Instructions for Hospital Patient Monitoring Simulator

---

## 📁 Project Files Included

```
amplify-deploy/
├── amplify.yml              # AWS Amplify build configuration
├── package.json             # Dependencies and scripts
├── public/
│   └── index.html           # HTML template
└── src/
    ├── index.js             # React entry point
    ├── App.jsx              # Main application
    ├── components/
    │   ├── ArduinoBootstrap.jsx
    │   ├── CloudEndpoint.jsx
    │   ├── CommandsReceived.jsx
    │   ├── ConnectionStatus.jsx
    │   ├── SerialPortManager.jsx
    │   ├── SystemDashboard.jsx
    │   └── VitalsConfigurator.jsx
    └── styles/
        └── App.css          # All styles
```

---

## 🔧 Prerequisites

1. **AWS Account** - Sign up at https://aws.amazon.com
2. **GitHub Account** - Sign up at https://github.com
3. **Git** installed on your computer
4. **Node.js 18+** (optional, for local testing)

---

## 📋 Method 1: Deploy via AWS Amplify Console (Recommended - No CLI needed)

### Step 1: Create a GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `hospital-patient-monitor`
3. Select **Private** or **Public**
4. Click **Create repository**

### Step 2: Upload Code to GitHub

**Option A: Using GitHub Web Interface (Easiest)**

1. In your new repository, click **"uploading an existing file"**
2. Drag and drop ALL files from the `amplify-deploy` folder
3. Click **Commit changes**

**Option B: Using Git Command Line**

```bash
# Navigate to the amplify-deploy folder
cd amplify-deploy

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Hospital Patient Monitor Simulator"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/hospital-patient-monitor.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 3: Deploy to AWS Amplify

1. **Open AWS Amplify Console**
   - Go to https://console.aws.amazon.com/amplify/
   - Sign in with your AWS account

2. **Create New App**
   - Click **"New app"** → **"Host web app"**

3. **Connect Repository**
   - Select **GitHub**
   - Click **"Connect to GitHub"**
   - Authorize AWS Amplify to access your repositories
   - Select your `hospital-patient-monitor` repository
   - Select branch: `main`
   - Click **Next**

4. **Configure Build Settings**
   - App name: `hospital-patient-monitor` (or your choice)
   - The build settings will be auto-detected from `amplify.yml`
   - Verify settings show:
     ```
     Build command: npm run build
     Output directory: build
     ```
   - Click **Next**

5. **Review and Deploy**
   - Review all settings
   - Click **"Save and deploy"**

6. **Wait for Deployment**
   - Build typically takes 2-5 minutes
   - Watch the progress: Provision → Build → Deploy → Verify

7. **Access Your App**
   - Once complete, click the URL provided
   - Format: `https://main.xxxxxxxxxx.amplifyapp.com`

---

## 📋 Method 2: Deploy via Amplify CLI

### Step 1: Install Amplify CLI

```bash
# Install globally
npm install -g @aws-amplify/cli

# Configure with your AWS credentials
amplify configure
```

During `amplify configure`:
- Sign in to AWS Console when browser opens
- Select your region (e.g., `us-east-1`)
- Create a new IAM user for Amplify
- Copy Access Key ID and Secret Access Key
- Enter them when prompted

### Step 2: Initialize Amplify Project

```bash
# Navigate to project folder
cd amplify-deploy

# Initialize Amplify
amplify init
```

Answer the prompts:
```
? Enter a name for the project: hospitalmonitor
? Initialize the project with the above configuration? Yes
? Select the authentication method: AWS profile
? Please choose the profile: default
```

### Step 3: Add Hosting

```bash
amplify add hosting
```

Select:
```
? Select the plugin module: Hosting with Amplify Console
? Choose a type: Manual deployment
```

### Step 4: Publish

```bash
amplify publish
```

Your app URL will be displayed after deployment.

---

## ⚙️ Configuration Options

### Custom Domain Setup

1. In Amplify Console, go to **App settings** → **Domain management**
2. Click **Add domain**
3. Enter your domain name
4. Follow DNS configuration instructions

### Environment Variables

1. Go to **App settings** → **Environment variables**
2. Add variables like:
   - `REACT_APP_IOT_ENDPOINT`: Your AWS IoT endpoint
   - `REACT_APP_API_URL`: Your backend API URL

### Build Settings Customization

Edit `amplify.yml` for custom build configuration:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: build
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

---

## 🔄 Continuous Deployment

Once connected to GitHub, Amplify automatically:
- Detects new commits to `main` branch
- Triggers automatic rebuild and deployment
- Updates your live app within minutes

To deploy updates:
```bash
git add .
git commit -m "Your changes"
git push
```

---

## 🧪 Local Testing (Optional)

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:3000
```

---

## 🔒 HTTPS Configuration

AWS Amplify automatically provides:
- Free SSL/TLS certificate
- HTTPS enforcement
- Auto-renewal of certificates

This is **required** for Web Serial API to work.

---

## 🐛 Troubleshooting

### Build Fails

1. Check **Build logs** in Amplify Console
2. Common issues:
   - Node.js version mismatch → Update `package.json` engines
   - Missing dependencies → Run `npm install` locally first
   - Syntax errors → Test with `npm run build` locally

### App Not Loading

1. Check browser console for errors
2. Verify all files were uploaded
3. Clear browser cache

### Serial Port Not Working

- Ensure you're using **Chrome**, **Edge**, or **Opera**
- App must be served over **HTTPS** (Amplify provides this)
- Check browser permissions for serial access

### 502/503 Errors

- Wait a few minutes after deployment
- Check CloudFront distribution status
- Try hard refresh (Ctrl+Shift+R)

---

## 📊 Monitoring & Analytics

In Amplify Console:
- **Monitoring** → View access logs
- **Analytics** → Enable Amazon Pinpoint (optional)

---

## 💰 Cost Estimate

AWS Amplify Hosting:
- **Build minutes**: First 1000 free/month
- **Hosting**: First 5GB free/month
- **Data transfer**: First 15GB free/month

Most small-medium apps cost **$0-5/month**.

---

## 📚 Additional Resources

- [AWS Amplify Documentation](https://docs.amplify.aws/)
- [AWS Amplify Hosting](https://docs.aws.amazon.com/amplify/latest/userguide/welcome.html)
- [React Documentation](https://react.dev/)
- [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API)

---

## ✅ Deployment Checklist

- [ ] GitHub repository created
- [ ] All project files uploaded
- [ ] AWS Amplify app created
- [ ] Repository connected
- [ ] Build successful
- [ ] App accessible via HTTPS URL
- [ ] Tested in Chrome/Edge/Opera
- [ ] Serial port functionality verified

---

**🎉 Congratulations! Your Hospital Patient Monitor Simulator is now live on AWS!**
