#!/bin/bash

# Deployment script for Supabase Edge Functions
# Usage: ./supabase/deploy.sh

set -e

echo "🚀 Deploying Supabase Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed."
    echo "Install it with: npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase."
    echo "Login with: supabase login"
    exit 1
fi

echo "✅ Supabase CLI found and authenticated"

# Link project if not already linked
if [ ! -f ".supabase/config.toml" ]; then
    echo "📎 Linking to Supabase project..."
    supabase link --project-ref tcwmbwkvflnranchrhyr
else
    echo "✅ Project already linked"
fi

# Apply database migrations
echo "📊 Applying database migrations..."
supabase db push || echo "⚠️  Migration may have already been applied"

# Deploy Edge Functions
echo "📦 Deploying render-video function..."
supabase functions deploy render-video --no-verify-jwt

echo "📦 Deploying check-render-status function..."
supabase functions deploy check-render-status --no-verify-jwt

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Test your functions at: https://supabase.com/dashboard/project/tcwmbwkvflnranchrhyr/functions"
echo "2. (Optional) Set SHOTSTACK_API_KEY for production rendering:"
echo "   supabase secrets set SHOTSTACK_API_KEY=your_key"
echo "3. Start your app: npm run dev"
echo ""
