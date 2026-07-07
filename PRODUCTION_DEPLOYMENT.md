# AlterEGO Production Deployment Guide

## Environment Configuration

### Backend Required Variables (.env)

```bash
# =========================
# API & Deployment
# =========================
ENVIRONMENT=production  # development|staging|production
DEBUG=false

# Server Configuration
PORT=8000
WS_HOST=0.0.0.0
WS_PORT=8000

# ========================
# Authentication (CRITICAL)
# ========================
JWT_SECRET_KEY=your-random-secret-key-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440  # 24 hours
REFRESH_TOKEN_EXPIRE_DAYS=7

# Database (Create strong passwords!)
DATABASE_URL=sqlite:///./alterego.db  # For development
# DATABASE_URL=postgresql://user:password@host:5432/alterego  # For production

# Redis (For caching & message queues)
REDIS_URL=redis://localhost:6379/0

# Neo4j (For knowledge graph)
NEO4J_URL=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=your-password

# ========================
# AI & LLM Services
# ========================
OPENAI_API_KEY=sk-your-key-here
MODEL_NAME=gpt-4o-mini
OPENAI_ORG_ID=org-xxx  # Optional

# Alternative LLMs
ANTHROPIC_API_KEY=sk-ant-your-key
OLLAMA_BASE_URL=http://localhost:11434

# ========================
# Voice Services
# ========================
ELEVENLABS_API_KEY=your-elevenlabs-key
ELEVENLABS_VOICE_ID=default_voice_id

# ========================
# Web Search & Tools
# ========================
TAVILY_API_KEY=your-tavily-key
SERPER_API_KEY=your-serper-key  # Alternative search

# ========================
# Monitoring & Logging
# ========================
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
LOG_LEVEL=INFO
PROMETHEUS_ENABLED=true

# ========================
# Frontend URLs
# ========================
FRONTEND_URL=http://localhost:3000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# ========================
# Tool Permissions
# ========================
ENABLE_DESKTOP_AUTOMATION=false  # Disable by default!
ENABLE_TOOL_EXECUTION=true
MAX_TOOL_TIMEOUT_SECONDS=30

# ========================
# Rate Limiting
# ========================
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_BURST_SIZE=10

# ========================
# Voice Settings
# ========================
ENABLE_WAKEWORD=true
WAKEWORD_MODEL=porcupine
WAKEWORD_CONFIDENCE_THRESHOLD=0.5

# ========================
# Feature Flags
# ========================
ENABLE_VOICE_CLONING=false
ENABLE_AGENTS=true
ENABLE_BROWSER_AUTOMATION=true
ENABLE_VISION=true
```

### Frontend Environment Variables (.env.local)

```bash
# API URLs
NEXT_PUBLIC_API_URL=https://api.alterego.ai
NEXT_PUBLIC_WS_URL=wss://api.alterego.ai/ws

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_DEBUG=false
```

---

## Security Checklist

### 🔐 BEFORE PRODUCTION DEPLOYMENT

- [ ] Change `JWT_SECRET_KEY` to a random, strong key (min 32 characters)
- [ ] Set `ENVIRONMENT=production`
- [ ] Set `DEBUG=false`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Set strong database password
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS_ORIGINS to your domain only
- [ ] Enable Sentry error tracking
- [ ] Set `ENABLE_DESKTOP_AUTOMATION=false` (unless explicitly needed)
- [ ] Rotate OPENAI_API_KEY in production vault
- [ ] Enable rate limiting
- [ ] Setup database backups
- [ ] Configure log rotation
- [ ] Enable monitoring and alerting
- [ ] Test error handling & recovery
- [ ] Setup uptime monitoring
- [ ] Document runbooks for incidents

---

## Deployment Platforms

### Render (Recommended for Beginners)

1. **Create render.yaml**:
```yaml
services:
  - type: web
    name: alterego-backend
    env: python
    plan: standard
    
    buildCommand: pip install -r voice-system/backend/requirements.txt
    startCommand: cd voice-system/backend && uvicorn main:app --host 0.0.0.0 --port $PORT
    
    envVars:
      - key: ENVIRONMENT
        value: production
      - key: OPENAI_API_KEY
        sync: false
      - key: JWT_SECRET_KEY
        sync: false
```

2. **Deploy**:
   - Connect GitHub repository
   - Render auto-deploys on push

### Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add environment variables
4. Auto-deploys

### Docker + Kubernetes

For enterprise deployments.

```bash
# Build
docker build -t alterego-backend -f voice-system/backend/Dockerfile .

# Run
docker run -e OPENAI_API_KEY=$OPENAI_API_KEY alterego-backend
```

---

## Database Setup

### SQLite (Development)
```bash
# Already configured, just works
SQLITE_URL=sqlite:///./alterego.db
```

### PostgreSQL (Production - Recommended)
```bash
# 1. Create database
createdb alterego

# 2. Set connection string
DATABASE_URL=postgresql://user:password@host:5432/alterego

# 3. Run migrations
alembic upgrade head
```

### Neo4j (Knowledge Graph)
```bash
# 1. Run Neo4j container
docker run -d \
  -e NEO4J_AUTH=neo4j/password \
  -p 7687:7687 \
  neo4j

# 2. Set connection string
NEO4J_URL=bolt://localhost:7687
```

### Redis (Caching & Message Queue)
```bash
# 1. Run Redis
docker run -d -p 6379:6379 redis

# 2. Set connection string
REDIS_URL=redis://localhost:6379/0
```

---

## Monitoring & Observability

### Sentry (Error Tracking)

```bash
1. Create account at https://sentry.io
2. Create project for Python/FastAPI
3. Get DSN
4. Set: SENTRY_DSN=<your-dsn>
```

### Prometheus + Grafana (Metrics)

```bash
# 1. Run Prometheus
docker run -d \
  -v ./prometheus.yml:/etc/prometheus/prometheus.yml \
  -p 9090:9090 \
  prom/prometheus

# 2. Run Grafana
docker run -d \
  -p 3000:3000 \
  grafana/grafana

# 3. Add Prometheus as datasource in Grafana
# 4. Create dashboards
```

### Uptime Monitoring

Use services like:
- Better Uptime
- UptimeRobot
- StatusPage

---

## Backup & Disaster Recovery

### Daily Database Backups

```bash
# PostgreSQL
pg_dump alterego > backup-$(date +%Y%m%d).sql

# Restore
psql alterego < backup-20250101.sql
```

### Automated Backups (AWS S3)

```python
import boto3
from datetime import datetime

def backup_database():
    s3 = boto3.client('s3')
    
    # Backup filename
    filename = f"backup-{datetime.now().isoformat()}.sql"
    
    # Upload to S3
    s3.upload_file(filename, 'alterego-backups', filename)
```

---

## Performance Optimization

### Caching Strategy

```python
# Cache frequently accessed data
@app.get("/api/memory")
@cache(expire=300)  # 5 minutes
async def get_memory():
    pass
```

### Database Indexing

```sql
-- Create indexes for common queries
CREATE INDEX idx_user_id ON conversations(user_id);
CREATE INDEX idx_timestamp ON messages(timestamp);
CREATE INDEX idx_embedding ON memories USING ivfflat (embedding);
```

### Load Balancing

Use:
- Nginx (reverse proxy)
- HAProxy
- AWS ELB / ALB
- Render's built-in load balancing

---

## Troubleshooting

### Backend won't start

```bash
# Check logs
journalctl -u alterego -n 100

# Test import
python -c "from main import app; print('OK')"

# Verify dependencies
pip list | grep fastapi
```

### WebSocket connection fails

- Ensure `WSS://` for production (TLS required)
- Check firewall rules
- Verify reverse proxy supports WebSockets
- Check browser console for errors

### High memory usage

- Check for memory leaks in agents
- Monitor Vector DB size
- Implement cache eviction
- Use `memory_profiler` to profile

### Rate limiting too aggressive

Adjust:
```
RATE_LIMIT_REQUESTS_PER_MINUTE=100
RATE_LIMIT_BURST_SIZE=10
```

Or implement user-based limits in code.

---

## Maintenance

### Weekly Tasks

- [ ] Check error logs in Sentry
- [ ] Review application metrics
- [ ] Test backup restoration
- [ ] Check disk space

### Monthly Tasks

- [ ] Update dependencies (`pip list --outdated`)
- [ ] Rotate secrets/keys
- [ ] Review and update rate limits
- [ ] Security audit logs
- [ ] Performance analysis

### Quarterly Tasks

- [ ] Full security audit
- [ ] Disaster recovery drill
- [ ] Capacity planning
- [ ] Update documentation

---

## Production Readiness Checklist

- [ ] All environment variables configured
- [ ] Database backups automated
- [ ] Error tracking (Sentry) configured
- [ ] Monitoring & alerts setup
- [ ] Rate limiting enabled
- [ ] Authentication tested
- [ ] Tool permissions configured
- [ ] CORS properly configured
- [ ] HTTPS/TLS enabled
- [ ] Database migrations applied
- [ ] Log rotation configured
- [ ] Uptime monitoring active
- [ ] Runbooks documented
- [ ] On-call rotation established
- [ ] Incident response plan ready

---

## Contacts & Support

- **Documentation**: https://docs.alterego.ai
- **Support**: support@alterego.ai
- **Issues**: https://github.com/OmSinghBais/AlterEgo-System/issues
- **Community**: Discord/Slack

