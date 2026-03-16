## Pixel Hangman

Hangman game with design and frontend theme. Requires Node.js and a Supabase account.

## Team Members and Contributions

- **Alyssa**: EJS logic and code improvements from base code
- **Bruna**: Database connection and CSS styling
- **Cesaria**: JavaScript logic and code improvements for the game and words
- **Sandy**: Server creation, connection, and base code generation

## How to run the application locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create `.env` file

In the project root, create a `.env` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace these with the actual values from your Supabase project.

### 3. Start the server

```bash
npm run dev
```

The app will be available at **http://localhost:3000** in your browser.
