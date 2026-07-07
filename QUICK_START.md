# AlterEGO Quick Start — Production Deployment

## 🚀 5-Minute Deployment

### Step 1: Setup Environment (2 min)

```bash
# Clone repo
git clone https://github.com/OmSinghBais/AlterEgo-System.git
cd AlterEgo-System

# Backend environment
cd voice-system/backend
cp ../../PRODUCTION_DEPLOYMENT.md .env
# Edit .env with your actual secrets:
nano .env
```

**Critical variables to set:**
```bash
JWT_SECRET_KEY=<generate-random-32-char-string>
OPENAI_API_KEY=<your-openai-key>
ENVIRONMENT=production
DEBUG=false
```

### Step 2: Install Dependencies (1 min)

```bash
# Backend
cd voice-system/backend
pip install -r requirements.txt

# Frontend
cd ../../
npm install
npm run build
```

### Step 3: Test Locally (1 min)

```bash
# Terminal 1: Backend
cd voice-system/backend
python -m uvicorn main:app --reload

# Terminal 2: Frontend
npm run dev
```

Open http://localhost:3000

### Step 4: Deploy (1 min)

**Option A: Render**
```bash
git push origin main
# Go to https://dashboard.render.com
# Connect GitHub
# Deploy
```

**Option B: Docker**
```bash
docker compose up -d
```

---

## ✅ What's NOW Included

### Security ✅
- [x] JWT authentication on all API routes
- [x] Tool execution requires user confirmation
- [x] Rate limiting on all endpoints
- [x] Input validation on all requests
- [x] Secrets not logged

### Reliability ✅
- [x] WebSocket auto-reconnection
- [x] Message buffering during disconnection
- [x] Error boundaries prevent app crashes
- [x] Graceful error recovery
- [x] Health check endpoints

### Monitoring ✅
- [x] Sentry error tracking
- [x] Request/response logging
- [x] Performance metrics
- [x] Uptime monitoring ready
- [x] Trace IDs for debugging

---

## 🧪 Testing Your Deployment

### Test Authentication
```bash
# Login & get token
TOKEN=$(curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}' \
  | jq -r '.data.access_token')

# Use token
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/api/chat
```

### Test Rate Limiting
```bash
# Send 100 requests
for i in {1..100}; do
  curl http://localhost:8000/api/health
done

# Should get 429 (Too Many Requests) after limit
```

### Test Error Handling
```bash
# Invalid request
curl -X POST http://localhost:8000/api/chat \
  -d '{"invalid":"data"}'

# Should get formatted error response
```

### Test WebSocket
```bash
# Open browser console
const ws = new WebSocket("ws://localhost:8000/ws/voice");

ws.onmessage = (e) => console.log(e.data);
ws.send(JSON.stringify({type: "init"}));
```

---

## 📊 Health & Status

### Backend Health
```bash
curl http://localhost:8000/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "components": {
    "database": "online",
    "redis": "online",
    "llm": "online"
  },
  "uptime_seconds": 3600,
  "version": "4.0"
}
```

### WebSocket Status
```python
# In frontend
console.log(client.get_stats())
# {state: "connected", messages_sent: 42, ...}
```

---

## 🔧 Common Commands

### Development
```bash
# Backend
cd voice-system/backend
python -m uvicorn main:app --reload --log-level debug

# Frontend
npm run dev

# Both with docker-compose
docker compose up -d
```

### Production
```bash
# Build images
docker build -t alterego-backend voice-system/backend/
docker build -t alterego-frontend .

# Run with docker-compose
docker compose -f docker-compose.prod.yml up -d

# View logs
docker logs -f alterego-backend
```

### Database
```bash
# Migrations
alembic upgrade head

# Backup
pg_dump alterego > backup.sql

# Restore
psql alterego < backup.sql
```

### Monitoring
```bash
# Tail logs
journalctl -u alterego -f

# Check metrics
curl http://localhost:9090  # Prometheus

# View Grafana
open http://localhost:3000  # admin/admin
```

---

## 🆘 Troubleshooting

### WebSocket not connecting?
```bash
# Check if running on WSS (production)
echo "Should be: wss://yourdomain.com/ws"

# Check firewall
telnet yourdomain.com 443

# Check nginx config
cat /etc/nginx/sites-enabled/alterego
```

### API returning 401?
```bash
# Verify JWT_SECRET_KEY is set
echo $JWT_SECRET_KEY

# Check token expiry
# Tokens expire after 24 hours

# Refresh token
curl -X POST http://localhost:8000/api/auth/refresh \
  -H "Authorization: Bearer $REFRESH_TOKEN"
```

### Rate limit errors?
```bash
# Check remaining
curl http://localhost:8000/api/health -i | grep X-RateLimit

# Adjust limits in PRODUCTION_DEPLOYMENT.md
RATE_LIMIT_REQUESTS_PER_MINUTE=100
```

### Tool execution failing?
```bash
# Check safety permissions
# Open browser DevTools
console.log(toolResponse.permission_request)

# Approve in UI
# Or programmatically:
curl -X POST http://localhost:8000/api/permissions/approve \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"request_id":"xxx","approved":true}'
```

---

## 📈 Next Steps

1. **Deploy to Staging**
   - Use Render/Railway
   - Test full voice pipeline
   - Load test with vegeta

2. **Setup Monitoring**
   - Configure Sentry
   - Setup Prometheus
   - Create Grafana dashboards

3. **Security Audit**
   - OWASP scan
   - Penetration testing
   - Code review

4. **Performance Optimization**
   - Profile with py-spy
   - Optimize slow queries
   - Add caching

5. **Production Release**
   - Blue-green deployment
   - Canary rollout
   - Monitor closely

---

## 📞 Support

- **Docs**: PRODUCTION_DEPLOYMENT.md + HARDENING_COMPLETE.md
- **Issues**: https://github.com/OmSinghBais/AlterEgo-System/issues
- **Email**: support@alterego.ai

---

**Status**: ✅ Production Ready for Staging

**Last Updated**: 2025-01-15
**Version**: 4.0.0
