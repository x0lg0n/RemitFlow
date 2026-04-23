# RemitFlow Security Guide 🔒

**Production Security Best Practices & Secrets Management**

---

## 🚨 Critical Security Issues Fixed

### Problem: Secrets Hardcoded in docker-compose.yml

**Before (INSECURE):**

```yaml
environment:
  - JWT_SECRET=dev-secret-change-me
  - SEP10_SERVER_SECRET=SAC2T4LY4EOY35VZDBNBORDDLXA56S5FERIBTXXPTES2VJH5QFK2DODN
  - ORACLE_SECRET_KEY=412b18e689dc5f11fc8ca91a179a18e25ac0fa430cd5656074127df914bbad65
  - POSTGRES_PASSWORD=postgres
```

❌ **Problems:**

- Secrets visible in Git history
- Anyone with repo access can see credentials
- No separation between environments
- Impossible to rotate secrets without code changes

**After (SECURE):**

```yaml
env_file:
  - .env
environment:
  - JWT_SECRET=${JWT_SECRET}
  - SEP10_SERVER_SECRET=${SEP10_SERVER_SECRET}
  - ORACLE_SECRET_KEY=${ORACLE_SECRET_KEY}
  - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
```

✅ **Benefits:**

- Secrets stored in `.env` (ignored by Git)
- Different secrets per environment
- Easy to rotate without code changes
- Follows 12-factor app methodology

---

## 🔐 Secrets Management Strategy

### 1. Environment Files Structure

```
docker/
├── .env.example          # ✅ Commit to Git - template only
├── .env                  # ❌ NEVER commit - actual secrets
└── docker-compose.yml    # ✅ Commit - references .env vars
```

### 2. Git Ignore Rules

Already configured in `.gitignore`:

```
.env
.env.local
.env.production
docker/.env
```

### 3. Quick Setup

```bash
# Generate secure .env file with random secrets
./scripts/setup-env.sh

# Or manually
cp docker/.env.example docker/.env
# Edit with your secrets
nano docker/.env
```

---

## 🛡️ Security Best Practices

### Development Environment

#### 1. Generate Strong Secrets

```bash
# JWT Secret (minimum 32 bytes)
openssl rand -base64 32

# Stellar Keypairs (for SEP-10 and Oracle)
stellar keys generate --network testnet

# Database Password
openssl rand -base64 24
```

#### 2. Local Development Workflow

```bash
# 1. Clone repository
git clone https://github.com/your-org/remitflow.git
cd remitflow

# 2. Setup environment (generates secure secrets)
./scripts/setup-env.sh

# 3. Review generated secrets
cat docker/.env | grep -v '^#' | grep -v '^$'

# 4. Start services
cd docker && docker compose up -d

# 5. Verify
curl http://localhost:3001/health
```

### Production Environment

#### 1. Use Secret Management Services

**Option A: Docker Secrets (Swarm)**

```yaml
services:
  backend:
    secrets:
      - jwt_secret
      - sep10_secret

secrets:
  jwt_secret:
    external: true
  sep10_secret:
    external: true
```

**Option B: HashiCorp Vault**

```bash
# Store secrets in Vault
vault kv put secret/remitflow/production \
  jwt_secret="your-secret" \
  sep10_secret="your-secret"

# Retrieve in deployment
vault kv get -field=jwt_secret secret/remitflow/production
```

**Option C: AWS Secrets Manager**

```bash
# Store secret
aws secretsmanager create-secret \
  --name remitflow/production/jwt-secret \
  --secret-string "your-secret"

# Retrieve in ECS/EKS
aws secretsmanager get-secret-value \
  --secret-id remitflow/production/jwt-secret
```

#### 2. Environment-Specific Files

```
config/
├── .env.development    # Development secrets
├── .env.staging        # Staging secrets
└── .env.production     # Production secrets (restricted access)
```

Load based on environment:

```bash
docker compose --env-file config/.env.$ENVIRONMENT up -d
```

#### 3. Secret Rotation

**Monthly Rotation Checklist:**

- [ ] Rotate JWT_SECRET
- [ ] Rotate SEP10_SERVER_SECRET
- [ ] Rotate ORACLE_SECRET_KEY
- [ ] Rotate database passwords
- [ ] Rotate anchor API tokens
- [ ] Update all environments
- [ ] Test all services after rotation

**Rotation Script:**

```bash
#!/bin/bash
# scripts/rotate-secrets.sh

# Generate new secrets
NEW_JWT=$(openssl rand -base64 32)
NEW_DB=$(openssl rand -base64 24)

# Update .env file
sed -i "s|JWT_SECRET=.*|JWT_SECRET=$NEW_JWT|g" docker/.env
sed -i "s|POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=$NEW_DB|g" docker/.env

# Restart services
cd docker && docker compose down && docker compose up -d

echo "✅ Secrets rotated successfully"
```

---

## 🔍 Security Checklist

### Before Committing Code

- [ ] No `.env` files committed
- [ ] No hardcoded secrets in source code
- [ ] No API keys in comments
- [ ] No private keys in repository
- [ ] `.gitignore` includes all secret files
- [ ] Git history scanned for leaked secrets

### Before Deploying to Production

- [ ] All default passwords changed
- [ ] Strong secrets generated (32+ bytes)
- [ ] HTTPS/TLS enabled
- [ ] CORS restricted to production domains
- [ ] Rate limiting enabled
- [ ] Logging configured (no sensitive data in logs)
- [ ] Database access restricted
- [ ] Firewall rules configured

### Ongoing Security

- [ ] Regular dependency audits (`pnpm audit`)
- [ ] Secret rotation (monthly)
- [ ] Access log monitoring
- [ ] Failed authentication alerts
- [ ] Backup encryption
- [ ] SSL certificate renewal
- [ ] Penetration testing (quarterly)

---

## 🚫 Common Security Mistakes

### ❌ DON'T Do This

```yaml
# Hardcoded secrets in docker-compose.yml
environment:
  - JWT_SECRET=my-secret-123
  - DB_PASSWORD=password

# Committing .env files
git add docker/.env
git commit -m "Add environment config"

# Logging sensitive data
console.log('User token:', token);
logger.info('DB password:', process.env.DB_PASSWORD);

# Weak secrets
JWT_SECRET=123456
POSTGRES_PASSWORD=admin
```

### ✅ DO This Instead

```yaml
# Use env_file
env_file:
  - .env

# Keep .env out of Git
echo "docker/.env" >> .gitignore

# Never log secrets
logger.info('User authenticated successfully');
logger.debug('DB connection established');

# Strong, random secrets
JWT_SECRET=$(openssl rand -base64 32)
POSTGRES_PASSWORD=$(openssl rand -base64 24)
```

---

## 🛠️ Security Tools

### 1. Git Secrets Scanning

```bash
# Install git-secrets
brew install git-secrets  # macOS
apt-get install git-secrets  # Linux

# Scan for secrets
git-secrets --scan
```

### 2. Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit

# Add to .pre-commit-config.yaml
repos:
  - repo: https://github.com/Yelp/detect-secrets
    rev: v1.4.0
    hooks:
      - id: detect-secrets
```

### 3. Docker Security

```bash
# Scan images for vulnerabilities
docker scout cve remitflow-backend:latest

# Check container security
docker run --rm -it aquasec/trivy image remitflow-backend:latest
```

---

## 📋 Incident Response

### If Secrets Are Leaked

1. **Immediate Actions (within 1 hour)**
   - Rotate ALL compromised secrets
   - Revoke affected API tokens
   - Check access logs for unauthorized access
   - Notify security team

2. **Short-term (within 24 hours)**
   - Audit all systems using leaked secrets
   - Update .env files with new secrets
   - Restart all affected services
   - Monitor for suspicious activity

3. **Long-term (within 1 week)**
   - Investigate how leak occurred
   - Implement additional safeguards
   - Update security documentation
   - Conduct security training

### Emergency Secret Rotation

```bash
#!/bin/bash
# scripts/emergency-rotate.sh

echo "🚨 EMERGENCY SECRET ROTATION"
echo "This will rotate all secrets and restart services"
read -p "Continue? (y/N) " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Generate new secrets
  ./scripts/setup-env.sh

  # Restart all services
  cd docker && docker compose down && docker compose up -d

  echo "✅ Emergency rotation complete"
  echo "⚠️  Notify all team members to pull new .env file"
fi
```

---

## 📚 Resources

- [12-Factor App: Config](https://12factor.net/config)
- [Docker Secrets Documentation](https://docs.docker.com/engine/swarm/secrets/)
- [OWASP Secret Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Stellar Security Best Practices](https://developers.stellar.org/docs/fundamentals-and-concepts/security)

---

## 🆘 Support

- **Security Issues:** security@remitflow.io
- **Documentation:** [Security Guide](https://docs.remitflow.io/security)
- **Incident Reports:** [Status Page](https://status.remitflow.io)

---

**Remember: Security is everyone's responsibility. When in doubt, rotate the secret!** 🔐
