import express from 'express';
import { createServer as createViteServer } from 'vite';
import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import db from './db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this';

app.use(express.json());
app.use(cookieParser());

// Middleware to authenticate user
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.cookies.truebee_token;
  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      req.user = null;
    } else {
      req.user = user;
    }
    next();
  });
};

app.use(authenticateToken);

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const insert = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)');
    const info = insert.run(username, hashedPassword);
    
    const token = jwt.sign({ id: info.lastInsertRowid, username }, JWT_SECRET, { expiresIn: '7d' });
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ user: { id: info.lastInsertRowid, username } });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Username already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('truebee_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.json({ user: { id: user.id, username: user.username } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('truebee_token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none'
  });
  res.json({ message: 'Logged out' });
});

app.get('/api/auth/me', (req: any, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// History Routes
app.get('/api/history', (req: any, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  
  const history = db.prepare('SELECT * FROM history WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ history });
});

app.post('/api/generate', async (req: any, res) => {
  const { topic, highlights, platform, tone, length, language } = req.body;
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'DeepSeek API key not configured' });
  }

  const targetLength = length === '短篇' ? '100字左右' : length === '中篇' ? '300字左右' : '800字左右';
  const isNoEmoji = false; // Default to false as per current UI

  const prompt = `你既是一位金牌带货主播，也是一位顶尖的文案高手。你总能洞察人心，根据不同平台的特性写出别具一格的爆款文案。请为【${topic}】撰写一段极具感染力的${platform}文案。

【商品信息】
- 商品名称：${topic}
- 核心卖点：${highlights || '自行补充'}
- 目标语言：${language}
- 情感基调：${tone} ${tone === '诗情画意' ? '（要求：具有深厚的文学基底，文案风格清新、优美且富有诗意，像是在讲述一个美好的故事或描绘一幅画卷）' : ''}
- 适用场景：${platform}
- 字数要求：${targetLength}
${isNoEmoji ? '- 核心禁忌：文案中绝对不能出现任何Emoji表情符号（如🔥、✨、👍等），即使是作为标点也不行。' : ''}

【撰写要求】
1. **爆款标题**：撰写一个20字以内的极具吸引力的标题。
2. **开头炸裂**：用一句强烈的痛点反问、惊人事实或独特视角开场。**严禁多次重复使用“家人们”**，尝试多样化的抓眼球开头。
3. **内容种草**：结合卖点描述使用场景，用词要接地气、口语化。
4. **平台深度适配**：
   - **小红书**：排版精美（多用符号分段），强调“种草分享”和“实用干货”，语气亲切如闺蜜，多用Emoji。
   - **抖音**：节奏极快，视觉感强，强调“反转”或“震撼”，引导点击小黄车，语气高亢。
   - **微信朋友圈**：像朋友间的真实分享，强调“信任感”和“情感共鸣”，引导私信或看评论区。
   - **Instagram**：极简、时尚、生活化，强调“视觉美感”和“氛围感”，多用英文标签。
   - **知乎**：专业、客观、深度，采用“谢邀”体或硬核科普风，强调“逻辑性”和“知识点”。
   - **闲鱼**：语气随性、真实，强调“诚心转让”或“捡漏机会”，突出性价比和真实使用感受。
5. **结尾引导**：根据平台调性自然收尾。**不一定非要催促下单**，可以是引导讨论、求赞、求关注或建立共鸣。
6. **格式规范**：分段清晰，严禁出现任何"[插入...]"等占位符。**全文严禁出现星号字符（*）**。
7. **字数控制**：严格控制在${targetLength}。

请开始你的表演：`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: "You are a helpful viral copywriting assistant." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8,
        stream: false
      })
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('DeepSeek API Error:', errorText);
        throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    let content = data.choices[0].message.content;

    // Programmatic safeguard: Remove all '*' characters as requested by user
    content = content.replace(/\*/g, '');

    // Save to history if user is logged in
    if (req.user) {
      try {
        const insert = db.prepare(`
          INSERT INTO history (user_id, topic, highlights, platform, tone, length, language, content)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);
        insert.run(req.user.id, topic, highlights || '', platform, tone, length, language, content);
      } catch (dbError) {
        console.error('Failed to save history:', dbError);
      }
    }

    res.json({ content });

  } catch (error: any) {
    console.error('Error calling DeepSeek:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
