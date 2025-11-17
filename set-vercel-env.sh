#!/bin/bash
echo "VITE_SUPABASE_URL: https://tcwmbwkvflnranchrhyr.supabase.co" | vercel env add VITE_SUPABASE_URL production --force
echo "VITE_SUPABASE_ANON_KEY: sb_publishable_Gsrt45m5y4Rdd6EPSAE-AQ_u-mf-7nq" | vercel env add VITE_SUPABASE_ANON_KEY production --force
echo "STABILITY_API_KEY: sk-WXnBYR2PlSevJWKDKrHb4EguvQFPACvJ2iyQdMGsS9sR1D4g" | vercel env add STABILITY_API_KEY production --force
