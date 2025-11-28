# 🐸 FocusFrog: Produtividade para Mentes Criativas

<div align="center">
  <img src="https://github.com/user-attachments/assets/b788a108-a58f-4a0b-99d7-56e632b73319" width="256" alt="FocusFrog Icon" />
</div>

FocusFrog é um aplicativo de produtividade gamificado, desenhado especificamente para ajudar pessoas com TDAH e mentes criativas a transformar tarefas em conquistas. Usando técnicas como o método Pomodoro e reforço positivo, o app transforma o foco em uma jornada recompensadora.

---

## 🚀 Como Começar

Siga os passos abaixo para rodar o projeto localmente na sua máquina.

**Pré-requisitos:**
*   [Node.js](https://nodejs.org/) (versão 18 ou superior)

**Instalação:**

1.  **Clone o repositório:**
    Obtenha a URL (HTTPS ou SSH) clicando no botão "Code" no topo desta página e execute o comando abaixo em seu terminal.
    ```bash
    git clone <URL_DO_REPOSITÓRIO>
    ```

2.  **Entre na pasta do projeto:**
    ```bash
    cd focusfrog
    ```

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

4.  **Rode o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

Após esses passos, o aplicativo estará rodando em `http://localhost:5173`.

## 🛠️ Stack de Tecnologia

*   **Framework:** [React](https://react.dev/)
*   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Estilização:** CSS Modules + Variáveis CSS Globais

## 🏛️ Arquitetura do Projeto ("Arquitetura da Casa")

O projeto segue uma filosofia de organização clara para garantir escalabilidade e manutenção:

*   **/src/components**: Componentes de UI reutilizáveis (a "Mobília").
*   **/src/screens**: As telas principais do aplicativo (os "Cômodos").
*   **/src/context**: Gerenciadores de estado global (os "Cérebros").
*   **/src/hooks**: Hooks customizados para lógica reutilizável (as "Caixas de Ferramentas").
*   **/src/global-styles.css**: Estilos globais e de base (a "Fundação").
*   **`[Componente].module.css`**: Estilos específicos para um componente ou tela (a "Decoração").
