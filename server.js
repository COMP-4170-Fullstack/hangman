import 'dotenv/config'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import cookieParser from 'cookie-parser'
import { createClient } from '@supabase/supabase-js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in the .env file')
  console.error('Copy .env.example to .env and fill in your Supabase project credentials.')
  process.exit(1)
}

// Middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

// Set EJS as templating engine
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Helper to create Supabase client with user token
function getSupabaseClient(accessToken = null) {
  const options = accessToken ? {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  } : {}
  return createClient(supabaseUrl, supabaseAnonKey, options)
}

// Ensure user has a profile (creates one if missing - used instead of DB trigger)
async function ensureProfile(supabase, user) {
  const { data: existing } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', user.id)
    .single()
  if (existing) return
  const username = user.user_metadata?.username || 'player_' + user.id.slice(0, 8)
  await supabase.from('profiles').insert({
    id: user.id,
    username,
    total_score: 0,
    games_played: 0,
    games_won: 0
  })
}

// Auth middleware
async function authMiddleware(req, res, next) {
  const accessToken = req.cookies['sb-access-token']
  const refreshToken = req.cookies['sb-refresh-token']
  
  if (!accessToken) {
    req.user = null
    return next()
  }

  const supabase = getSupabaseClient(accessToken)
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    // Try to refresh token
    if (refreshToken) {
      const { data, error: refreshError } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
      if (!refreshError && data.session) {
        res.cookie('sb-access-token', data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 })
        res.cookie('sb-refresh-token', data.session.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 604800000 })
        req.user = data.user
        req.accessToken = data.session.access_token
        return next()
      }
    }
    res.clearCookie('sb-access-token')
    res.clearCookie('sb-refresh-token')
    req.user = null
    return next()
  }
  
  req.user = user
  req.accessToken = accessToken
  next()
}

// Protected route middleware
function requireAuth(req, res, next) {
  if (!req.user) {
    return res.redirect('/auth')
  }
  next()
}

app.use(authMiddleware)

// Routes

// Home page
app.get('/', async (req, res) => {
  const supabase = getSupabaseClient()
  const { data: topPlayers } = await supabase
    .from('profiles')
    .select('username, total_score')
    .order('total_score', { ascending: false })
    .limit(3)
  
  res.render('index', { 
    user: req.user,
    topPlayers: topPlayers || []
  })
})

// Auth page
app.get('/auth', (req, res) => {
  if (req.user) {
    return res.redirect('/game')
  }
  res.render('auth', { error: null, mode: 'login' })
})

// Sign up
app.post('/auth/signup', async (req, res) => {
  const { email, password, username } = req.body
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username },
      emailRedirectTo: `${req.protocol}://${req.get('host')}/auth/callback`
    }
  })
  
  if (error) {
    return res.render('auth', { error: error.message, mode: 'signup' })
  }
  
  res.render('signup-success', { email })
})

// Login
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body
  const supabase = getSupabaseClient()
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  
  if (error) {
    return res.render('auth', { error: error.message, mode: 'login' })
  }
  
  res.cookie('sb-access-token', data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 })
  res.cookie('sb-refresh-token', data.session.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 604800000 })
  const supabaseWithAuth = getSupabaseClient(data.session.access_token)
  await ensureProfile(supabaseWithAuth, data.session.user)
  res.redirect('/game')
})

// Logout
app.get('/auth/logout', async (req, res) => {
  if (req.accessToken) {
    const supabase = getSupabaseClient(req.accessToken)
    await supabase.auth.signOut()
  }
  res.clearCookie('sb-access-token')
  res.clearCookie('sb-refresh-token')
  res.redirect('/')
})

// Auth callback (for email confirmation)
app.get('/auth/callback', async (req, res) => {
  const { code } = req.query
  if (code) {
    const supabase = getSupabaseClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && data.session) {
      res.cookie('sb-access-token', data.session.access_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 3600000 })
      res.cookie('sb-refresh-token', data.session.refresh_token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', maxAge: 604800000 })
      const supabaseWithAuth = getSupabaseClient(data.session.access_token)
      await ensureProfile(supabaseWithAuth, data.session.user)
    }
  }
  res.redirect('/game')
})

// Game page
app.get('/game', requireAuth, async (req, res) => {
  const supabase = getSupabaseClient(req.accessToken)
  await ensureProfile(supabase, req.user)
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', req.user.id)
    .single()
  
  res.render('game', { 
    user: req.user,
    activePage: 'game',
    profile: profile || { username: 'Player', total_score: 0 }
  })
})

// API: Update score
app.post('/api/update-score', requireAuth, async (req, res) => {
  const { newScore, won, wordId, gameScore } = req.body
  const supabase = getSupabaseClient(req.accessToken)
  
  // Update profiles (total_score, games_played, games_won)
  await supabase
    .from('profiles')
    .update({
      total_score: newScore,
      updated_at: new Date().toISOString()
    })
    .eq('id', req.user.id)
  
  // Increment game counters
  await supabase.rpc('increment_games', {
    user_id: req.user.id,
    won: won
  })
  
  // Save to game table (each game session)
  if (wordId != null) {
    await supabase.from('game').insert({
      user_id: req.user.id,
      word_id: wordId,
      game_score: gameScore ?? (won ? 100 : 0)
    })
  }
  
  res.json({ success: true })
})

// Scoreboard page
app.get('/scoreboard', async (req, res) => {
  const supabase = getSupabaseClient()
  
  const { data: players } = await supabase
    .from('profiles')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(50)
  
  res.render('scoreboard', { 
    user: req.user,
    activePage: 'scoreboard',
    players: players || []
  })
})

// API: Get random word from Supabase
app.get('/api/words/random', async (req, res) => {
  const supabase = getSupabaseClient()
  const { data, error } = await supabase.rpc('get_random_word')
  
  if (error || !data?.length) {
    return res.status(500).json({ error: 'Failed to fetch word' })
  }
  
  const row = data[0]
  res.json({
    word_id: row.word_id,
    word: row.word,
    hint: row.hint,
    category: (row.category || 'design').toUpperCase()
  })
})

// API: Get scores (for real-time updates)
app.get('/api/scores', async (req, res) => {
  const supabase = getSupabaseClient()
  
  const { data: players } = await supabase
    .from('profiles')
    .select('*')
    .order('total_score', { ascending: false })
    .limit(50)
  
  res.json(players || [])
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

export default app
