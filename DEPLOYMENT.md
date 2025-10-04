# Internet Streets - Production Deployment Guide

## Netlify Deployment

### 1. Environment Variables Setup

In your Netlify dashboard, go to Site Settings > Environment Variables and add:

```
STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
OPENAI_API_KEY=sk-xxx
ADMIN_USER=your_admin_username
ADMIN_PASS=your_secure_password
NEXT_PUBLIC_BASE_URL=https://internetstreets.uk
```

### 2. Stripe Webhook Configuration

1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://internetstreets.uk/api/stripe-webhook`
3. Select events: `checkout.session.completed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

### 3. Domain Configuration

1. In Netlify dashboard, go to Domain Settings
2. Add custom domain: `internetstreets.uk`
3. Configure DNS records as instructed by Netlify

### 4. Build Settings

- Build command: `npm run build`
- Publish directory: `.next`
- Node version: 18

### 5. Deployment Checklist

- [ ] Environment variables configured
- [ ] Stripe webhook endpoint set up
- [ ] Custom domain configured
- [ ] SSL certificate active
- [ ] Test payment flow end-to-end
- [ ] Admin panel accessible
- [ ] All 10 services generating PDFs correctly

### 6. Post-Deployment Testing

1. Test each service with Stripe test mode
2. Verify PDF generation works
3. Check admin dashboard functionality
4. Test error handling scenarios
5. Verify mobile responsiveness

## Production Monitoring

- Monitor Stripe webhook deliveries
- Check OpenAI API usage and costs
- Monitor PDF generation success rates
- Track admin panel access logs
