# Surebets - Telegram para Discord Webhook

Bot em TypeScript que recebe mensagens de um grupo específico do Telegram e envia para um webhook do Discord.

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure as variáveis de ambiente criando um arquivo `.env` na raiz do projeto:
```
TELEGRAM_API_ID=your_api_id
TELEGRAM_API_HASH=your_api_hash
TELEGRAM_PHONE_NUMBER=your_phone_number
TELEGRAM_GROUP_ID=your_group_id
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
```

## Como obter as credenciais

### Telegram
1. Acesse https://my.telegram.org/apps
2. Faça login com sua conta
3. Crie uma aplicação para obter `API_ID` e `API_HASH`
4. Para obter o `GROUP_ID`, você pode usar bots como @userinfobot no grupo

### Discord
1. Vá nas configurações do servidor Discord
2. Integrações > Webhooks
3. Crie um novo webhook e copie a URL

## Uso

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## Formatação de código

```bash
npm run format
```

