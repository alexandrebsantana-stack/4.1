-- =============================================
-- Sistema de Chamados - Script do Banco de Dados
-- SENAI Candeias - Atividade 04.1
-- =============================================

CREATE DATABASE IF NOT EXISTS sistema_chamados
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sistema_chamados;

CREATE TABLE IF NOT EXISTS chamados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(150) NOT NULL,
  descricao TEXT,
  prioridade ENUM('baixa', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
  status ENUM('aberto', 'em_andamento', 'resolvido', 'fechado') NOT NULL DEFAULT 'aberto',
  solicitante VARCHAR(120) NOT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = InnoDB;

INSERT INTO chamados (titulo, descricao, prioridade, status, solicitante)
VALUES
  ('Computador não liga', 'O computador da recepção não liga pela manhã.', 'alta', 'aberto', 'Maria Souza'),
  ('Problema com e-mail', 'Não estou recebendo e-mails na caixa de entrada.', 'media', 'em_andamento', 'João Silva'),
  ('Instalar software', 'Necessário instalar o pacote Office na sala 3.', 'baixa', 'aberto', 'Ana Costa'),
  ('Projetor com defeito', 'O projetor da sala de reuniões está com imagem tremida.', 'urgente', 'resolvido', 'Pedro Lima');
