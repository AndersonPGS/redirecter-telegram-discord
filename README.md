# Surebets - Telegram para Discord Webhook

Bot em TypeScript que recebe mensagens de um ou mais grupos do Telegram e envia para um webhook do Discord.

## 🚀 Instalação Rápida (Para Não Programadores)

**Quer uma instalação super simples?** Veja o arquivo **[INSTRUCOES.md](INSTRUCOES.md)** com um guia passo a passo detalhado!

**Resumo rápido:**
1. Instale o [Node.js](https://nodejs.org/) (versão LTS)
2. Execute `setup.bat` (duplo clique)
3. Configure o arquivo `.env` (copie do `env.example`)
4. Configure o arquivo `config.json`
5. Execute `run.bat` para iniciar o bot

## 📋 Pré Requisitos

Instale o [NodeJS](https://nodejs.org/en/download/current) 👍

## 🔧 Instalação Manual (Para Desenvolvedores)

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
```

2.1 Configure também o arquivo de `config.json`
- `"defaultTitle": ""` É o título da mensagem que será enviada para o Discord
- `"groupWebhooks": {}` Deixe como objeto vazio e inicialize o projeto pela primeira vez para receber os IDs dos grupos que estão enviando mensagens. Ao descobrir os IDs dos grupos que deseja monitorar, adicione-os ao objeto mapeando cada ID de grupo para seu respectivo webhook URL do Discord. Exemplo: 
```json
"groupWebhooks": {
  "-1001234567890": "https://discord.com/api/webhooks/123456789/abcdefgh",
  "-1009876543210": "https://discord.com/api/webhooks/987654321/xyzuvwst"
}
```

## Como obter as credenciais

### Telegram

1. Acesse https://my.telegram.org/apps
2. Faça login com sua conta
3. Crie uma aplicação para obter `API_ID` e `API_HASH`

### Discord

1. Vá nas configurações do servidor Discord
2. Integrações > Webhooks
3. Crie um novo webhook para cada canal que deseja receber mensagens e copie a URL
4. Configure cada webhook URL no arquivo `config.json` mapeando para o ID do grupo correspondente

## ▶️ Uso

### Modo Simples (Windows)

**Duplo clique em `run.bat`** - O script verifica tudo automaticamente e inicia o bot.

### Modo Desenvolvimento

```bash
npm run dev
```

### Modo Produção

```bash
npm run build
npm start
```

**Ou simplesmente execute `run.bat`** após a instalação.

## Formatação de código

```bash
npm run format
```
