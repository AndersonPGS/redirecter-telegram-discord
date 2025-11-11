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
TELEGRAM_PASSWORD=your_telegram_password
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/your_webhook_url
```

2.1 Configure também o arquivo de `config.json`
`"defaultTitle": ""` É o título da mensagem que será enviada para o Discord
`"groupId": ""` Deixe em branco e inicialize o projeto pela primeira vez para receber os IDs dos grupos que estão enviando mensagens, ao descobrir o ID do grupo que deseja monitorar, coloque-o aqui.

## Como obter as credenciais

### Telegram

1. Acesse https://my.telegram.org/apps
2. Faça login com sua conta
3. Crie uma aplicação para obter `API_ID` e `API_HASH`

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
