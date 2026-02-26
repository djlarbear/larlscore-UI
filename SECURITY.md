# SECURITY

This repository is intended to be **public**.

## Never commit
- Any API key (OddsAPI, OpenAI, etc.)
- `.env.local`, `.env.*` with real values
- SSH keys / private keys
- Logs containing request URLs with keys
- Any SQLite `.db` or other private data

## If a secret is committed
1) Rotate the secret immediately
2) Remove it from source
3) Assume it is compromised (even if the repo is later deleted)
