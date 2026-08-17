const db = require('../config/db');

exports.createChamado = async (req, res) => {
  const { titulo, descricao, prioridade, status, solicitante } = req.body;

  if (!titulo || !solicitante) {
    return res.status(400).json({
      erro: 'Campos obrigatórios ausentes. Informe ao menos "titulo" e "solicitante".',
    });
  }

  const chamado = {
    titulo,
    descricao: descricao || '',
    prioridade: prioridade || 'media',
    status: status || 'aberto',
    solicitante,
  };

  try {
    const [result] = await db.query(
      'INSERT INTO chamados (titulo, descricao, prioridade, status, solicitante) VALUES (?, ?, ?, ?, ?)',
      [chamado.titulo, chamado.descricao, chamado.prioridade, chamado.status, chamado.solicitante]
    );
    const [rows] = await db.query('SELECT * FROM chamados WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao cadastrar chamado.', detalhe: err.message });
  }
};

exports.listChamados = async (_req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM chamados ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao listar chamados.', detalhe: err.message });
  }
};

exports.getChamado = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM chamados WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Chamado não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao buscar chamado.', detalhe: err.message });
  }
};

exports.updateChamado = async (req, res) => {
  const { id } = req.params;
  const { titulo, descricao, prioridade, status, solicitante } = req.body;

  try {
    const [rows] = await db.query('SELECT * FROM chamados WHERE id = ?', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ erro: 'Chamado não encontrado.' });
    }

    const atual = rows[0];
    const chamado = {
      titulo: titulo !== undefined ? titulo : atual.titulo,
      descricao: descricao !== undefined ? descricao : atual.descricao,
      prioridade: prioridade !== undefined ? prioridade : atual.prioridade,
      status: status !== undefined ? status : atual.status,
      solicitante: solicitante !== undefined ? solicitante : atual.solicitante,
    };

    await db.query(
      'UPDATE chamados SET titulo = ?, descricao = ?, prioridade = ?, status = ?, solicitante = ? WHERE id = ?',
      [chamado.titulo, chamado.descricao, chamado.prioridade, chamado.status, chamado.solicitante, id]
    );

    const [updated] = await db.query('SELECT * FROM chamados WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao atualizar chamado.', detalhe: err.message });
  }
};

exports.deleteChamado = async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM chamados WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ erro: 'Chamado não encontrado.' });
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao excluir chamado.', detalhe: err.message });
  }
};
