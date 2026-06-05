# CineMatch 🎬

Um aplicativo web full-stack desenvolvido para ajudar você (ou seu grupo) a organizar sessões de cinema em casa e manter um histórico do que já assistiram.

🔗 **Acesse o projeto online:** [CineMatch](https://cinematch-br.vercel.app/login)

## 📌 Funcionalidades

- **Busca e Seleção:** Pesquise filmes no catálogo e adicione as opções que você está com vontade de assistir hoje.
- **Sorteio ou Escolha Direta:** Está na dúvida do que assistir? Use a roleta para o sistema sortear um filme da sua lista. Já sabe o que quer ver? Você pode pular o sorteio e selecionar o filme diretamente. O app se adapta perfeitamente para uso individual ou em grupo!
- **Avaliações e Histórico:** Após a sessão, o filme fica salvo no seu histórico. Lá você pode dar sua nota e marcar como favorito para não esquecer dos melhores.
- **Acesso de Visitante:** Criei um login de Visitante para quem quer testar a plataforma na hora. Os dados gerados nessa sessão são descartados depois, garantindo que o banco de dados oficial continue limpo.
- **Autenticação e Segurança:** Login e registro reais com proteção de rotas e armazenamento seguro de sessão usando tokens JWT.

> 💡 **Decisão de Arquitetura (E-mails):** A funcionalidade de envio de e-mails (para validação de conta e recuperação de senha) não foi incluída no escopo deste projeto. Provedores de nuvem gratuitos — como o Render, onde o backend está hospedado — bloqueiam conexões de saída nas portas SMTP padrão como medida anti-spam, inviabilizando o disparo de e-mails via SMTP tradicionais em ambientes não-pagos.

## 🛠 Tecnologias

**Frontend**
- Angular (v17+)
- TypeScript
- SCSS Puro e Design Responsivo
- Hospedagem: Vercel

**Backend**
- PHP / Laravel (v11)
- Laravel Sanctum (Tokens JWT)
- Banco de Dados: MySQL (Hospedado na Aiven)
- Docker
- Hospedagem da API: Render

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- PHP 8.2+
- Composer
- Node.js 18+
- Angular CLI
- Banco de Dados MySQL (ou pacote como Laragon/XAMPP)

### 1. Configurando o Backend (Laravel)

```bash
# Acesse a pasta do backend
cd backend

# Instale as dependências
composer install

# Crie o arquivo .env (não esqueça de preencher suas configs de BD e SMTP)
cp .env.example .env

# Gere a chave de aplicação do Laravel
php artisan key:generate

# Rode as migrations
php artisan migrate

# Suba o servidor local (porta padrão 8000)
php artisan serve
```

### 2. Configurando o Frontend (Angular)

```bash
# Acesse a pasta do frontend
cd frontend

# Instale os pacotes do Node
npm install

# Inicie o servidor do Angular
ng serve
```
*(Nota: Certifique-se de que o arquivo `src/environments/environment.ts` esteja apontando para a sua API local `http://127.0.0.1:8000/api` para testes).*

Acesse `http://localhost:4200` no seu navegador para ver o projeto rodando.

## 🤝 Quer falar comigo?

Se desejar tirar dúvidas, discutir sobre oportunidades ou apenas se conectar, sinta-se à vontade para entrar em contato:

- 📧 **E-mail:** inicolaskleiton@gmail.com
- 💼 **LinkedIn:** [linkedin.com/in/nicolaskleiton](https://linkedin.com/in/nicolaskleiton)

Muito obrigado por visitar e avaliar o meu repositório! 🚀
