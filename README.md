# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/047fe3b3-9d68-41f5-9ff0-084e7203e326

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/047fe3b3-9d68-41f5-9ff0-084e7203e326) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/047fe3b3-9d68-41f5-9ff0-084e7203e326) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

# Tenda Família Digital

Sistema de gerenciamento de acampamentos familiares com blog integrado.

## 🖼️ Sistema de Imagens do Blog

### Imagem de Destaque
- **Upload**: Use o componente `ImageUpload` no formulário de blog
- **Funcionalidades**: 
  - Upload com drag & drop
  - Preview da imagem
  - Botão de remoção (X vermelho)
  - Aspect ratio 16:9 (video)

### Imagens no Conteúdo
- **Upload**: Use o componente `ContentImageUpload` no editor de conteúdo
- **Funcionalidades**:
  - Upload múltiplas imagens
  - Controle de tamanho personalizado
  - HTML inline com estilos CSS
  - Botão sempre disponível

#### Opções de Tamanho:
1. **Automático**: `max-width: 100%; height: auto;`
2. **Pequeno**: `width: 300px; height: auto;`
3. **Médio**: `width: 500px; height: auto;`
4. **Grande**: `width: 800px; height: auto;`
5. **Largura total**: `width: 100%; height: auto;`
6. **Personalizado**: Define largura e altura específicas

#### Exemplos de HTML gerado:
```html
<!-- Tamanho automático -->
<img src="url-da-imagem" alt="Descrição" style="max-width: 100%; height: auto;" class="my-4 rounded-lg shadow mx-auto" />

<!-- Tamanho médio -->
<img src="url-da-imagem" alt="Descrição" style="width: 500px; height: auto;" class="my-4 rounded-lg shadow mx-auto" />

<!-- Tamanho personalizado -->
<img src="url-da-imagem" alt="Descrição" width="400px" height="300px" class="my-4 rounded-lg shadow mx-auto" />
```

### Como usar:
1. **No editor de conteúdo**, clique no botão "Adicionar Imagem"
2. **Configure as opções** clicando no ícone de engrenagem (⚙️)
3. **Defina o texto alternativo** para acessibilidade
4. **Escolha o tamanho** ou defina dimensões personalizadas
5. **Faça upload** da imagem
6. **O HTML será inserido** automaticamente no conteúdo

### Suporte a Markdown e HTML:
- ✅ Markdown padrão: `![alt](url)`
- ✅ HTML inline: `<img src="url" alt="alt" style="..." />`
- ✅ Controle total de tamanho e estilo
- ✅ Preview em tempo real
- ✅ Renderização correta na página pública

## 🚀 Tecnologias

- React + TypeScript
- Vite
- Tailwind CSS
- Supabase (banco de dados + storage)
- React Router
- Lucide Icons

## 📦 Instalação

```bash
npm install
npm run dev
```

## 🗄️ Banco de Dados

Execute as migrações do Supabase:

```bash
supabase db reset
```

## 📝 Blog

O sistema inclui um blog completo com:
- ✅ CRUD de posts
- ✅ Upload de imagens
- ✅ Controle de tamanho de imagens
- ✅ Markdown + HTML inline
- ✅ SEO otimizado
- ✅ Tags e categorias
- ✅ Preview em tempo real
