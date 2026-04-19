# Deployment Notes

## Preferred first deployment options

- GitHub Pages
- Netlify
- Cloudflare Pages

## Why static hosting first

- Works well with a plain A-Frame site
- Easy to share preview URLs
- Low operational complexity

## Requirement

Quest Browser testing should use HTTPS.

## Current plan

Use GitHub Pages first, publishing the contents of `web/` through a GitHub Actions workflow.

## Things to document once verified

- Which host we chose
- Exact deployment steps
- Any Quest Browser behavior differences from desktop
