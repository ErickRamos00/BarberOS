const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { run, get } = require('../database');
const { sendVerificationCode, verifyCode, sendWelcomeEmail } = require('../services/email');

const router = express.Router();
const SECRET_KEY = 'barber-secret-key-change-in-production';

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }
  
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, shop_name, password } = req.body;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const shop_slug = shop_name.toLowerCase().replace(/\s+/g, '-');
    
    await run(
      `INSERT INTO users (name, email, phone, shop_name, shop_slug, password) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, shop_name, shop_slug, hashedPassword]
    );

    // Obter user criado
    const user = await get('SELECT id, email, name, shop_name FROM users WHERE email = ?', [email]);
    
    // Criar config padrão
    await run(
      `INSERT INTO configs (user_id) VALUES (?)`,
      [user.id]
    );

    // Criar identity padrão
    await run(
      `INSERT INTO identity (user_id) VALUES (?)`,
      [user.id]
    );

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '30d' });
    
    res.json({
      message: 'Usuário registrado com sucesso',
      user: { id: user.id, email: user.email, name: user.name, shop: user.shop_name },
      token
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'E-mail ou senha inválidos' });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '30d' });
    
    res.json({
      message: 'Login bem-sucedido',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        shop: user.shop_name,
        slug: user.shop_slug
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter dados do usuário logado
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await get(
      'SELECT id, name, email, phone, shop_name, shop_slug, shop_address FROM users WHERE id = ?',
      [req.userId]
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar dados do usuário
router.put('/me', verifyToken, async (req, res) => {
  try {
    const { name, phone, shop_name, shop_address } = req.body;
    
    await run(
      `UPDATE users SET name = ?, phone = ?, shop_name = ?, shop_address = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, phone, shop_name, shop_address, req.userId]
    );

    const user = await get('SELECT id, name, email, phone, shop_name, shop_slug FROM users WHERE id = ?', [req.userId]);
    res.json({ message: 'Dados atualizados', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Alterar senha
router.post('/change-password', verifyToken, async (req, res) => {
  try {
    const { password, newPassword } = req.body;
    
    const user = await get('SELECT password FROM users WHERE id = ?', [req.userId]);
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Senha atual inválida' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await run(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, req.userId]
    );

    res.json({ message: 'Senha alterada com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ===== AUTENTICAÇÃO COM CÓDIGO =====

// Enviar código de verificação
router.post('/send-code', async (req, res) => {
  try {
    const { email, purpose = 'verificacao' } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email é obrigatório' });
    }

    // Verificar se email existe (para login)
    if (purpose === 'login') {
      const user = await get('SELECT id FROM users WHERE email = ?', [email]);
      if (!user) {
        return res.status(400).json({ error: 'Email não cadastrado' });
      }
    }

    const result = await sendVerificationCode(email, purpose);
    
    if (result.success) {
      res.json({ 
        message: 'Código enviado com sucesso',
        email: email,
        expiresIn: 15 * 60 // 15 minutos em segundos
      });
    } else {
      res.status(500).json({ error: 'Erro ao enviar código: ' + result.error });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Verificar código e fazer login
router.post('/verify-code', async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({ error: 'Email e código são obrigatórios' });
    }

    // Verificar código
    const verification = verifyCode(email, code);
    
    if (!verification.valid) {
      return res.status(400).json({ error: verification.message });
    }

    // Obter usuário
    const user = await get('SELECT id, name, email, shop_name, shop_slug FROM users WHERE email = ?', [email]);
    
    if (!user) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    // Gerar token
    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '30d' });
    
    res.json({
      message: 'Login bem-sucedido',
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        shop: user.shop_name,
        slug: user.shop_slug
      },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Registrar e enviar código de verificação
router.post('/register-with-code', async (req, res) => {
  try {
    const { name, email, phone, shop_name, password } = req.body;
    
    // Validações
    if (!name || !email || !phone || !shop_name || !password) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
    }

    // Verificar se email já existe
    const existing = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(400).json({ error: 'Este email já está cadastrado' });
    }

    // Criar usuário
    const hashedPassword = await bcrypt.hash(password, 10);
    const shop_slug = shop_name.toLowerCase().replace(/\s+/g, '-');
    
    await run(
      `INSERT INTO users (name, email, phone, shop_name, shop_slug, password) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email, phone, shop_name, shop_slug, hashedPassword]
    );

    // Obter user criado
    const user = await get('SELECT id, email, name, shop_name FROM users WHERE email = ?', [email]);
    
    // Criar config padrão
    await run(`INSERT INTO configs (user_id) VALUES (?)`, [user.id]);
    await run(`INSERT INTO identity (user_id) VALUES (?)`, [user.id]);

    // Enviar email de boas-vindas
    await sendWelcomeEmail(email, name, shop_name);

    // Enviar código de verificação
    const codeResult = await sendVerificationCode(email, 'verificacao');

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '30d' });
    
    res.json({
      message: 'Usuário registrado com sucesso. Verifique seu email.',
      user: { id: user.id, email: user.email, name: user.name, shop: user.shop_name },
      token,
      requiresVerification: true,
      verificationSent: codeResult.success
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Exportar middleware para usar em outras rotas
router.verifyToken = verifyToken;

module.exports = router;
