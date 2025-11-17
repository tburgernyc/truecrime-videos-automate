#!/bin/bash

# TrueCrime Clay Studio - Deploy Storyboard Function with Stability AI
# This script deploys the updated generate-storyboard function to Supabase

set -e  # Exit on any error

echo "🎨 TrueCrime Clay Studio - Deploying Storyboard Function"
echo "=================================================="
echo ""

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo ""
    echo "Install it first:"
    echo "  npm install -g supabase"
    echo ""
    echo "Or via homebrew:"
    echo "  brew install supabase/tap/supabase"
    exit 1
fi

echo "✅ Supabase CLI found: $(supabase --version)"
echo ""

# Check if logged in
echo "🔐 Checking Supabase authentication..."
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase"
    echo ""
    echo "Please login first:"
    echo "  supabase login"
    exit 1
fi

echo "✅ Authenticated with Supabase"
echo ""

# Set the secret
echo "🔑 Setting STABILITY_API_KEY secret..."
supabase secrets set STABILITY_API_KEY=sk-WXnBYR2PlSevJWKDKrHb4EguvQFPACvJ2iyQdMGsS9sR1D4g

echo "✅ Secret set successfully"
echo ""

# Deploy the function
echo "🚀 Deploying generate-storyboard function..."
supabase functions deploy generate-storyboard

echo ""
echo "=================================================="
echo "✅ Deployment Complete!"
echo ""
echo "Your storyboard function now generates real claymation images!"
echo ""
echo "Next steps:"
echo "1. Test it: npm run dev"
echo "2. Create a case and generate a storyboard"
echo "3. Wait 15-20 seconds for image generation"
echo "4. Verify images appear in the storyboard viewer"
echo ""
echo "See STABILITY_AI_SETUP.md for full details"
echo "=================================================="
