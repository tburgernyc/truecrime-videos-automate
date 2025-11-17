# Pre-Deployment Checklist

Use this checklist before deploying to production.

## Local Development ✅

- [ ] Run `npm install` successfully
- [ ] Run `npm run dev` - app loads without errors
- [ ] Test case research functionality
- [ ] Test script generation
- [ ] Test storyboard generation
- [ ] Verify auto-save works (check browser console)
- [ ] Test project save/load functionality
- [ ] Check browser console for errors

## Environment Configuration ✅

- [ ] `.env` file created from `.env.example`
- [ ] `VITE_SUPABASE_URL` set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` set correctly
- [ ] Optional: Production API keys added
- [ ] `.env` file NOT committed to git (check `.gitignore`)

## Supabase Setup ✅

### Database
- [ ] Supabase project created
- [ ] Migration `20250116_create_render_jobs.sql` applied
- [ ] `render_jobs` table exists in Supabase dashboard
- [ ] RLS policies enabled

### Edge Functions
- [ ] `research-case` function deployed
- [ ] `generate-script` function deployed
- [ ] `generate-storyboard` function deployed
- [ ] `generate-voiceover` function deployed
- [ ] `render-video` function deployed
- [ ] `check-render-status` function deployed
- [ ] Secrets set for production APIs (if using)

## Code Quality ✅

- [ ] Run `npm run build` - builds successfully
- [ ] No TypeScript errors
- [ ] No console errors in production build
- [ ] All imports resolve correctly
- [ ] Lazy loading working (check Network tab)

## Testing ✅

### Core Workflow
1. [ ] Enter case name and click "Research Case"
2. [ ] Verify research data appears
3. [ ] Click "Generate Script" button
4. [ ] Verify script editor populates
5. [ ] Edit script manually
6. [ ] Click "Generate Claymation Storyboard"
7. [ ] Verify storyboard scenes appear
8. [ ] Test voiceover generation (if API keys configured)
9. [ ] Test video assembly workflow

### Error Handling
- [ ] Test invalid case name (empty input)
- [ ] Test network disconnection
- [ ] Verify error boundary catches errors
- [ ] Test localStorage full scenario (if possible)

### UI/UX
- [ ] All buttons respond to clicks
- [ ] Loading states display correctly
- [ ] Toast notifications appear
- [ ] Phase gates prevent skipping
- [ ] Progress bar updates
- [ ] Responsive design works (mobile/tablet/desktop)

## Performance ✅

- [ ] Lighthouse score > 80 (run `npm run build && npm run preview`)
- [ ] Initial load < 3 seconds
- [ ] No memory leaks (check DevTools Performance tab)
- [ ] Images lazy load
- [ ] Code splitting working (check Network tab for chunked files)

## Security ✅

- [ ] No API keys in frontend code
- [ ] All API keys in environment variables
- [ ] Supabase RLS policies enabled
- [ ] CORS configured correctly
- [ ] Input sanitization working
- [ ] Error messages don't leak sensitive info

## Deployment Platform Specific

### Vercel
- [ ] Project connected to Git repository
- [ ] Environment variables added in Vercel dashboard
- [ ] Build command: `npm run build`
- [ ] Output directory: `dist`
- [ ] Framework preset: Vite

### Netlify
- [ ] Build command: `npm run build`
- [ ] Publish directory: `dist`
- [ ] Environment variables configured
- [ ] `_redirects` file for SPA routing (if needed)

### Custom Server
- [ ] Static files in `dist/` folder
- [ ] Web server configured (Apache/Nginx)
- [ ] HTTPS certificate installed
- [ ] Environment variables set on server

## Post-Deployment ✅

- [ ] Visit deployed URL - site loads
- [ ] Test all core features in production
- [ ] Check Supabase logs for edge function errors
- [ ] Monitor API usage/costs
- [ ] Set up error tracking (e.g., Sentry)
- [ ] Configure analytics (if desired)
- [ ] Test from different devices/browsers

## Documentation ✅

- [ ] `SETUP_GUIDE.md` reviewed
- [ ] `OPTIMIZATION_SUMMARY.md` reviewed
- [ ] README updated with deployment URL (after deploy)
- [ ] API key documentation accurate

## Optional Enhancements

- [ ] Custom domain configured
- [ ] SEO metadata added (`index.html`)
- [ ] Open Graph tags for social sharing
- [ ] Favicon customized
- [ ] Brand assets replaced
- [ ] Analytics integrated
- [ ] Error monitoring setup (Sentry/LogRocket)

---

## Quick Commands

```bash
# Local development
npm install
npm run dev

# Build for production
npm run build
npm run preview

# Deploy with Vercel CLI
vercel --prod

# Deploy with Netlify CLI
netlify deploy --prod

# Test production build locally
npm run preview
```

---

## Troubleshooting Build Issues

### TypeScript errors
```bash
# Check types
npx tsc --noEmit

# If errors persist
rm -rf node_modules package-lock.json
npm install
```

### Build fails
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Edge functions not working
```bash
# Redeploy all functions
supabase functions deploy research-case
supabase functions deploy generate-script
supabase functions deploy generate-storyboard
supabase functions deploy generate-voiceover
supabase functions deploy render-video
supabase functions deploy check-render-status
```

---

**Once all checkboxes are complete, you're ready to deploy! 🚀**
