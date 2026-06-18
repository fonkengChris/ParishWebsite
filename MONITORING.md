# Monitoring & Analytics Setup

This document describes how to set up monitoring and analytics for the Parish Website.

## 1. Request & Error Logging

The backend uses **Pino** for structured logging:

- **Request Logging**: All HTTP requests are automatically logged with method, URL, status, response time, IP, and user agent
- **Error Logging**: Errors are logged with full context including request details, user info, and stack traces
- **Auth Logging**: Authentication events (login attempts, successes, failures) are logged separately

### Log Levels

Set `LOG_LEVEL` environment variable:
- `error` - Only errors
- `warn` - Warnings and errors
- `info` - Info, warnings, and errors (default)
- `debug` - All logs including debug messages

### Log Output

- **Development**: Pretty-printed colored logs to console
- **Production**: JSON structured logs (can be piped to log aggregation services)

### Example Log Output

```json
{
  "level": "INFO",
  "time": "2024-01-15T10:30:45.123Z",
  "context": "request",
  "method": "GET",
  "url": "/api/gallery",
  "statusCode": 200,
  "responseTime": 45,
  "ip": "192.168.1.1",
  "userAgent": "Mozilla/5.0..."
}
```

## 2. Uptime Monitoring

### UptimeRobot (Free)

1. Sign up at [UptimeRobot.com](https://uptimerobot.com)
2. Add a new monitor:
   - **Monitor Type**: HTTP(s)
   - **URL**: Your production API endpoint (e.g., `https://api.yourdomain.com/api/health`)
   - **Interval**: 5 minutes (free tier)
   - **Alert Contacts**: Add your email/SMS
3. The `/api/health` endpoint is already set up and won't be logged

### Health Check Endpoint

The API includes a health check endpoint at `/api/health` that returns:
```json
{
  "status": "ok",
  "message": "Parish Website API is running",
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

## 3. Web Analytics

### Plausible Analytics (Privacy-friendly, Recommended)

1. Sign up at [Plausible.io](https://plausible.io)
2. Add your domain
3. Set environment variable:
   ```bash
   VITE_PLAUSIBLE_DOMAIN=yourdomain.com
   ```
4. The analytics script will automatically load

### Google Analytics

1. Create a Google Analytics 4 property
2. Get your Measurement ID (format: `G-XXXXXXXXXX`)
3. Set environment variable:
   ```bash
   VITE_GA_ID=G-XXXXXXXXXX
   ```
4. The analytics script will automatically load

### Environment Variables

Add to your `.env` file:

```bash
# Analytics (choose one or both)
VITE_PLAUSIBLE_DOMAIN=yourdomain.com
VITE_GA_ID=G-XXXXXXXXXX
```

## 4. Log Aggregation (Optional)

For production, consider sending logs to:

- **Logtail** (formerly Timber)
- **Datadog**
- **Sentry** (for error tracking)
- **Elasticsearch + Kibana**

### Example: Sending to Logtail

```javascript
// backend/utils/logger.js
import pino from 'pino';

const logger = pino({
  transport: {
    target: '@logtail/pino',
    options: { sourceToken: process.env.LOGTAIL_TOKEN }
  }
});
```

## 5. Performance Monitoring

### Frontend Performance

- Images are lazy-loaded using Intersection Observer
- API responses are cached for 5 minutes
- Cache-Control headers are set on responses

### Backend Performance

- Request response times are logged
- Database query performance can be monitored via Mongoose debug mode:
  ```bash
  DEBUG=mongoose:* npm start
  ```

## 6. Error Tracking

Errors are automatically logged with:
- Full stack trace
- Request context (method, URL, body, query, params)
- User information (if authenticated)
- IP address and user agent

For production error tracking, consider integrating:
- **Sentry**: `npm install @sentry/node`
- **Rollbar**: `npm install rollbar`

## 7. Monitoring Checklist

- [ ] Set up UptimeRobot monitoring
- [ ] Configure analytics (Plausible or Google Analytics)
- [ ] Set `LOG_LEVEL` environment variable
- [ ] Review logs regularly
- [ ] Set up alerts for critical errors
- [ ] Monitor API response times
- [ ] Track error rates

## 8. Log Retention

By default, logs are output to console/stdout. For production:

1. **Docker**: Logs go to stdout/stderr (captured by Docker)
2. **PM2**: Use `pm2 logs` or configure log files
3. **Systemd**: Logs captured by journald
4. **Cloud Platforms**: Use platform-specific log aggregation

## 9. Security Considerations

- Logs may contain sensitive information (passwords, tokens)
- Never log passwords or full request bodies in production
- Sanitize logs before sending to third-party services
- Use log rotation to prevent disk space issues

