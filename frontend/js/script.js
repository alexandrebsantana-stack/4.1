const API_URL = window.location.host
  ? `${window.location.protocol}//${window.location.host}/api/chamados`
  : 'http://localhost:3000/api/chamados';

const state = {
  chamados: [],
  editandoId: null,
};

const elements = {
  form: document.getElementById('chamado-form'),
  titulo: document.getElementById('titulo'),
  solicitante: document.getElementById('solicitante'),
  prioridade: document.getElementById('prioridade'),
  status: document.getElementById('status'),
  descricao: document.getElementById('descricao'),
  btnSubmit: document.getElementById('btn-submit'),
  btnCancel: document.getElementById('btn-cancel'),
  formTitle: document.getElementById('form-title'),
  tbody: document.getElementById('chamados-tbody'),
  loading: document.getElementById('loading'),
  errorBox: document.getElementById('error-box'),
  emptyState: document.getElementById('empty-state'),
  busca: document.getElementById('busca'),
  btnRefresh: document.getElementById('btn-refresh'),
  modal: document.getElementById('modal'),
  modalTitle: document.getElementById('modal-title'),
  modalBody: document.getElementById('modal-body'),
  modalClose: document.getElementById('modal-close'),
  modalCancel: document.getElementById('modal-cancel'),
  modalEdit: document.getElementById('modal-edit'),
  modalDelete: document.getElementById('modal-delete'),
  toast: document.getElementById('toast'),
};

const PRIORIDADES_LABEL = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

const STATUS_LABEL = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
  fechado: 'Fechado',
};

async function api(path = '', options = {}) {
  const res = await fetch(API_URL + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = data && data.erro ? data.erro : 'Erro na requisição à API.';
    throw new Error(message);
  }

  return data;
}

function showToast(message, type = 'success') {
  elements.toast.textContent = message;
  elements.toast.className = `toast ${type}`;
  elements.toast.hidden = false;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    elements.toast.hidden = true;
  }, 2800);
}

function showError(message) {
  elements.errorBox.textContent = message;
  elements.errorBox.hidden = false;
}

function clearError() {
  elements.errorBox.hidden = true;
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function normalize(str) {
  return String(str).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function filterChamados() {
  const term = normalize(elements.busca.value.trim());
  if (!term) return state.chamados;
  return state.chamados.filter((c) =>
    normalize(`${c.titulo} ${c.solicitante} ${c.status}`).includes(term)
  );
}

function renderTable() {
  const list = filterChamados();

  elements.loading.hidden = true;

  if (list.length === 0) {
    elements.tbody.innerHTML = '';
    elements.emptyState.hidden = false;
    return;
  }

  elements.emptyState.hidden = true;

  elements.tbody.innerHTML = list
    .map((c) => `
      <tr>
        <td>#${c.id}</td>
        <td><strong>${esc(c.titulo)}</strong></td>
        <td>${esc(c.solicitante)}</td>
        <td><span class="pill pill-${esc(c.prioridade)}">${PRIORIDADES_LABEL[c.prioridade] || esc(c.prioridade)}</span></td>
        <td><span class="pill pill-${esc(c.status)}">${STATUS_LABEL[c.status] || esc(c.status)}</span></td>
        <td>${formatDate(c.data_criacao)}</td>
        <td class="col-actions">
          <div class="row-actions">
            <button class="icon-btn" data-action="view" data-id="${c.id}" title="Ver">Ver</button>
            <button class="icon-btn" data-action="edit" data-id="${c.id}" title="Editar">Editar</button>
            <button class="icon-btn danger" data-action="delete" data-id="${c.id}" title="Excluir">Excluir</button>
          </div>
        </td>
      </tr>
    `)
    .join('');
}

async function loadChamados() {
  clearError();
  elements.loading.hidden = false;
  elements.tbody.innerHTML = '';
  elements.emptyState.hidden = true;

  try {
    state.chamados = await api();
    renderTable();
  } catch (err) {
    elements.loading.hidden = true;
    showError(`Não foi possível carregar os chamados: ${err.message}`);
  }
}

function resetForm() {
  elements.form.reset();
  state.editandoId = null;
  elements.formTitle.textContent = 'Abrir novo chamado';
  elements.btnSubmit.textContent = 'Abrir chamado';
  elements.btnCancel.hidden = true;
}

function fillForm(chamado) {
  elements.titulo.value = chamado.titulo || '';
  elements.solicitante.value = chamado.solicitante || '';
  elements.prioridade.value = chamado.prioridade || 'media';
  elements.status.value = chamado.status || 'aberto';
  elements.descricao.value = chamado.descricao || '';
}

async function handleSubmit(event) {
  event.preventDefault();
  clearError();

  const payload = {
    titulo: elements.titulo.value.trim(),
    solicitante: elements.solicitante.value.trim(),
    prioridade: elements.prioridade.value,
    status: elements.status.value,
    descricao: elements.descricao.value.trim(),
  };

  elements.btnSubmit.disabled = true;

  try {
    if (state.editandoId) {
      await api(`/${state.editandoId}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
      showToast('Chamado atualizado com sucesso!');
    } else {
      await api('', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      showToast('Chamado aberto com sucesso!');
    }
    resetForm();
    closeModal();
    await loadChamados();
  } catch (err) {
    showError(err.message);
    showToast(err.message, 'error');
  } finally {
    elements.btnSubmit.disabled = false;
  }
}

function renderDetails(chamado) {
  elements.modalTitle.textContent = `Chamado #${chamado.id}`;
  elements.modalBody.innerHTML = `
    <div class="detail-row"><strong>Título:</strong> ${esc(chamado.titulo)}</div>
    <div class="detail-row"><strong>Solicitante:</strong> ${esc(chamado.solicitante)}</div>
    <div class="detail-row">
      <strong>Prioridade:</strong>
      <span class="pill pill-${esc(chamado.prioridade)}">${PRIORIDADES_LABEL[chamado.prioridade] || esc(chamado.prioridade)}</span>
    </div>
    <div class="detail-row">
      <strong>Status:</strong>
      <span class="pill pill-${esc(chamado.status)}">${STATUS_LABEL[chamado.status] || esc(chamado.status)}</span>
    </div>
    <div class="detail-row"><strong>Criado em:</strong> ${formatDate(chamado.data_criacao)}</div>
    <div class="detail-row"><strong>Descrição:</strong> ${esc(chamado.descricao) || '-'}</div>
  `;
  elements.modalEdit.dataset.id = chamado.id;
  elements.modalDelete.dataset.id = chamado.id;
  elements.modal.hidden = false;
}

function closeModal() {
  elements.modal.hidden = true;
}

async function handleDelete(id) {
  if (!confirm('Deseja realmente excluir este chamado?')) return;

  try {
    await api(`/${id}`, { method: 'DELETE' });
    closeModal();
    showToast('Chamado excluído!');
    await loadChamados();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

function handleTableClick(event) {
  const btn = event.target.closest('button[data-action]');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const chamado = state.chamados.find((c) => c.id === id);
  if (!chamado) return;

  const action = btn.dataset.action;

  if (action === 'view') {
    renderDetails(chamado);
    elements.modalEdit.hidden = false;
    elements.modalDelete.hidden = false;
  } else if (action === 'edit') {
    closeModal();
    state.editandoId = id;
    fillForm(chamado);
    elements.formTitle.textContent = `Editar chamado #${id}`;
    elements.btnSubmit.textContent = 'Salvar alterações';
    elements.btnCancel.hidden = false;
    elements.form.scrollIntoView({ behavior: 'smooth' });
  } else if (action === 'delete') {
    handleDelete(id);
  }
}

elements.form.addEventListener('submit', handleSubmit);
elements.btnCancel.addEventListener('click', resetForm);
elements.btnRefresh.addEventListener('click', loadChamados);
elements.busca.addEventListener('input', renderTable);
elements.tbody.addEventListener('click', handleTableClick);
elements.modalClose.addEventListener('click', closeModal);
elements.modalCancel.addEventListener('click', closeModal);
elements.modalEdit.addEventListener('click', () => {
  const chamado = state.chamados.find((c) => c.id === Number(elements.modalEdit.dataset.id));
  if (!chamado) return;
  closeModal();
  state.editandoId = chamado.id;
  fillForm(chamado);
  elements.formTitle.textContent = `Editar chamado #${chamado.id}`;
  elements.btnSubmit.textContent = 'Salvar alterações';
  elements.btnCancel.hidden = false;
  elements.form.scrollIntoView({ behavior: 'smooth' });
});
elements.modalDelete.addEventListener('click', () => {
  handleDelete(Number(elements.modalDelete.dataset.id));
});

document.addEventListener('click', (event) => {
  if (event.target === elements.modal) closeModal();
});

loadChamados();
