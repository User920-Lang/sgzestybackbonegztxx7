# PastBackboneGztxx7

Backend de torneios clássicos para Stumble Guys.

## Deploy no Render

1. Sobe o projeto no GitHub
2. Entra em [render.com](https://render.com) → New Web Service
3. Conecta o repositório
4. Render detecta o `render.yaml` automaticamente
5. Em Environment Variables adiciona:
   - `API_TOKEN` = sua token

Pronto! URL: `https://pastbackbonegztxx7.onrender.com`

## Rodar local

```bash
npm install
# cria .env com:
# API_TOKEN=sua_token
# PORT=3000
npm start
```

## Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | /dashboard | UI dos torneios |
| GET | /health | Status do servidor |
| GET | /api/tournaments | Lista torneios |
| GET | /api/tournaments/config | Config atual |
| PATCH | /api/tournaments/config | Atualiza config |
| POST | /api/tournaments/:id/register | Registrar jogador |
| GET | /api/tournaments/:id/bracket | Ver bracket |
| POST | /api/tournaments/:id/bracket/result | Reportar resultado |
| POST | /api/players/login | Login jogador |
