const path = require('path');
const express = require('express');
const exphbs = require('express-handlebars');
const { Tarefa, Usuario } = require('./src/models');
const app = express();

// Middleware para interpretar dados do corpo da requisição
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Middleware para arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do Handlebars
const hbs = exphbs.create({
  defaultLayout: 'main',
  extname: '.handlebars',
});
hbs.handlebars.registerHelper('eq', (a, b) => a === b);
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

// Configurando diretório de views
app.set('views', path.join(__dirname, 'src', 'views'));

// Rota GET para cadastro de tarefas
app.get('/cadastrotarefa', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    const usuariosList = usuarios.map((usuario) => usuario.get({ plain: true }));
    res.render('cadastroTarefa', { usuarios: usuariosList });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).render('erro', { message: 'Erro ao buscar usuários.' });
  }
});

// Rota POST para cadastro de tarefas
app.post('/cadastrotarefa', async (req, res) => {
  try {
    const { descricao, setor, prioridade, usuario } = req.body;
    const usuarioEncontrado = await Usuario.findOne({ where: { nome: usuario } });
    if (!usuarioEncontrado) {
      return res.status(400).render('cadastroTarefa', { errorMessage: 'Usuário não encontrado.' });
    }
    await Tarefa.create({
      descricao,
      setor,
      status: 'a fazer',
      prioridade: prioridade.toLowerCase(),
      id_usuario: usuarioEncontrado.id,
    });
    const usuarios = await Usuario.findAll();
    const usuariosList = usuarios.map((usuario) => usuario.get({ plain: true }));
    res.render('cadastroTarefa', { successMessage: 'Tarefa cadastrada com sucesso!', usuarios: usuariosList });
  } catch (error) {
    console.error('Erro ao cadastrar tarefa:', error);
    res.status(500).render('erro', { message: 'Erro ao cadastrar tarefa.' });
  }
});

app.get('/', (req, res) => {
  res.render('cadastroUsuario');
});

// Rota GET para cadastro de usuário
app.get('/cadastrousuario', (req, res) => {
  res.render('cadastroUsuario');
});

// Rota POST para cadastro de usuário
app.post('/cadastrousuario', async (req, res) => {
  try {
    const { nome, email } = req.body;
    await Usuario.create({ nome, email });
    res.render('cadastroUsuario', { successMessage: 'Usuário cadastrado com sucesso!' });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).render('erro', { message: 'Erro ao cadastrar usuário.' });
  }
});

// Rota GET para gerenciamento de tarefas
app.get('/gerenciatarefa', async (req, res) => {
  try {
    const tarefas = await Tarefa.findAll({
      include: { model: Usuario, as: 'usuario' },
    });
    const tarefasList = tarefas.map((tarefa) => tarefa.get({ plain: true }));
    res.render('gerenciaTarefa', { tarefas: tarefasList });
  } catch (error) {
    console.error('Erro ao carregar tarefas:', error);
    res.status(500).render('erro', { message: 'Erro ao carregar tarefas.' });
  }
});

// Rota POST para alterar o status de uma tarefa
app.post('/alterarStatus', async (req, res) => {
  try {
    const { id, status } = req.body;

    // Atualizar o status da tarefa
    await Tarefa.update({ status }, { where: { id } });

    // Redirecionar de volta para a página de gerenciamento de tarefas
    res.redirect('/gerenciatarefa');
  } catch (error) {
    console.error('Erro ao alterar o status da tarefa:', error);
    res.status(500).render('erro', { message: 'Erro ao alterar o status da tarefa.' });
  }
});

// Rota POST para excluir tarefa
app.post('/excluirTarefa', async (req, res) => {
  try {
    const { id } = req.body;

    // Excluir a tarefa pelo ID
    await Tarefa.destroy({ where: { id } });

    // Redirecionar para a página de gerenciamento de tarefas após excluir
    res.redirect('/gerenciatarefa');
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).render('erro', { message: 'Erro ao excluir tarefa.' });
  }
});

// Rota POST para editar a tarefa
app.post('/editarTarefa', async (req, res) => {
  try {
    const { id, descricao, setor, prioridade } = req.body;

    // Atualizar os dados da tarefa
    await Tarefa.update({ descricao, setor, prioridade }, { where: { id } });

    // Redirecionar de volta para a página de gerenciamento de tarefas
    res.redirect('/gerenciatarefa');
  } catch (error) {
    console.error('Erro ao editar tarefa:', error);
    res.status(500).render('erro', { message: 'Erro ao editar tarefa.' });
  }
});



// Iniciando o servidor na porta 3000
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
