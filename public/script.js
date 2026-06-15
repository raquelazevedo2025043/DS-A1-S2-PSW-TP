const api = {
  categorias: "/api/categorias",
  jogos: "/api/jogos",
  jogosComCategoria: "/api/jogos-categorias",
  jogosDaCategoria: (id) => `/api/categorias/${id}/jogos`
};

const state = {
  categorias: [],
  jogos: [],
  jogosVisiveis: [],
  filtroAtual: { tipo: "all", id: null, nome: "Todos os jogos" }
};

const form = document.querySelector("#game-form");
const gameIdInput = document.querySelector("#game-id");
const nomeInput = document.querySelector("#nome");
const quantidadeInput = document.querySelector("#quantidade");
const precoInput = document.querySelector("#preco");
const categoriaSelect = document.querySelector("#id_categoria");
const saveButton = document.querySelector("#save-button");
const cancelButton = document.querySelector("#cancel-button");
const statusText = document.querySelector("#status");
const chips = document.querySelector("#category-chips");
const gamesTable = document.querySelector("#games-table");
const gamesTitle = document.querySelector("#games-title");
const gamesSubtitle = document.querySelector("#games-subtitle");
const joinedList = document.querySelector("#joined-list");
const allButton = document.querySelector("#all-button");

function setStatus(message, isError = false) {
  statusText.textContent = message;
  statusText.style.color = isError ? "#c93838" : "var(--muted)";
}

function formatPrice(value) {
  return Number(value).toFixed(2) + " EUR";
}

function getCategoriaNome(idCategoria) {
  const categoria = state.categorias.find((item) => Number(item.id) === Number(idCategoria));
  return categoria ? categoria.nome : "Sem categoria";
}

function renderCategoriaSelect() {
  categoriaSelect.innerHTML = state.categorias
    .map((categoria) => `<option value="${categoria.id}">${categoria.nome}</option>`)
    .join("");
}

function renderChips() {
  const activeId = state.filtroAtual.tipo === "category" ? Number(state.filtroAtual.id) : null;

  const items = [
    `<button type="button" class="chip ${state.filtroAtual.tipo === "all" ? "active" : ""}" data-action="all">Todos</button>`,
    ...state.categorias.map((categoria) => {
      const isActive = activeId === Number(categoria.id);
      return `<button type="button" class="chip ${isActive ? "active" : ""}" data-action="category" data-id="${categoria.id}" data-name="${categoria.nome}">${categoria.nome}</button>`;
    })
  ];

  chips.innerHTML = items.join("");
}

function renderGamesTable(games) {
  state.jogosVisiveis = games;
  gamesTitle.textContent = state.filtroAtual.nome;
  gamesSubtitle.textContent = `${games.length} registo(s) mostrados.`;

  if (!games.length) {
    gamesTable.innerHTML = `<tr><td class="empty" colspan="5">Sem registos para mostrar.</td></tr>`;
    return;
  }

  gamesTable.innerHTML = games
    .map((game) => `
      <tr>
        <td>${game.nome}</td>
        <td>${game.quantidade}</td>
        <td>${formatPrice(game.preco)}</td>
        <td>${game.categoria || getCategoriaNome(game.id_categoria)}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn btn-secondary" data-edit-id="${game.id}">Editar</button>
            <button type="button" class="btn btn-danger" data-delete-id="${game.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
    .join("");
}

function renderJoinedList(items) {
  if (!items.length) {
    joinedList.innerHTML = `<div class="empty">Sem dados.</div>`;
    return;
  }

  joinedList.innerHTML = items
    .slice(0, 6)
    .map((item) => `
      <article class="joined-item">
        <strong>${item.nome}</strong>
        <span>${item.categoria} · ${item.quantidade} unidades · ${formatPrice(item.preco)}</span>
      </article>
    `)
    .join("");
}

async function loadCategorias() {
  const response = await fetch(api.categorias);
  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as categorias.");
  }

  state.categorias = await response.json();
  renderCategoriaSelect();
  renderChips();
}

async function loadJogos() {
  const response = await fetch(api.jogos);
  if (!response.ok) {
    throw new Error("Nao foi possivel carregar os jogos.");
  }

  state.jogos = await response.json();
  if (state.filtroAtual.tipo === "all") {
    renderGamesTable(state.jogos);
  }
}

async function loadJoinedPreview() {
  const response = await fetch(api.jogosComCategoria);
  if (!response.ok) {
    throw new Error("Nao foi possivel carregar a vista com JOIN.");
  }

  const items = await response.json();
  renderJoinedList(items);
}

async function loadAllView() {
  state.filtroAtual = { tipo: "all", id: null, nome: "Jogos" };
  renderChips();
  gamesTitle.textContent = "Jogos";
  gamesSubtitle.textContent = "Todos os registos da tabela.";
  renderGamesTable(state.jogos);
}

async function loadCategoryView(id, nome) {
  const response = await fetch(api.jogosDaCategoria(id));
  if (!response.ok) {
    renderGamesTable([]);
    setStatus("Nao existem jogos nessa categoria.");
    return;
  }

  const items = await response.json();
  state.filtroAtual = { tipo: "category", id: Number(id), nome: `Jogos: ${nome}` };
  renderChips();
  renderGamesTable(items);
}

function resetForm() {
  form.reset();
  gameIdInput.value = "";
  saveButton.textContent = "Guardar";
}

function fillForm(gameId) {
  const game = state.jogosVisiveis.find((item) => Number(item.id) === Number(gameId))
    || state.jogos.find((item) => Number(item.id) === Number(gameId));

  if (!game) {
    setStatus("Nao foi possivel localizar o jogo.", true);
    return;
  }

  gameIdInput.value = game.id;
  nomeInput.value = game.nome;
  quantidadeInput.value = game.quantidade;
  precoInput.value = game.preco;
  categoriaSelect.value = game.id_categoria;
  saveButton.textContent = "Atualizar";
  setStatus(`A editar: ${game.nome}`);
}

async function refreshCurrentView() {
  await loadJogos();

  if (state.filtroAtual.tipo === "category") {
    await loadCategoryView(state.filtroAtual.id, state.filtroAtual.nome.replace("Jogos: ", ""));
  } else {
    await loadAllView();
  }

  await loadJoinedPreview();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const payload = {
    nome: nomeInput.value.trim(),
    quantidade: Number(quantidadeInput.value),
    preco: Number(precoInput.value),
    id_categoria: Number(categoriaSelect.value)
  };

  if (!payload.nome || Number.isNaN(payload.quantidade) || Number.isNaN(payload.preco) || Number.isNaN(payload.id_categoria)) {
    setStatus("Preenche todos os campos corretamente.", true);
    return;
  }

  const gameId = gameIdInput.value;
  const method = gameId ? "PUT" : "POST";
  const url = gameId ? `${api.jogos}/${gameId}` : api.jogos;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || "Operacao falhou.");
    }

    resetForm();
    setStatus(method === "POST" ? "Jogo criado com sucesso." : "Jogo atualizado com sucesso.");
    await refreshCurrentView();
  } catch (error) {
    setStatus(error.message, true);
  }
});

cancelButton.addEventListener("click", () => {
  resetForm();
  setStatus("Edicao cancelada.");
});

allButton.addEventListener("click", async () => {
  await loadAllView();
});

chips.addEventListener("click", async (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  if (button.dataset.action === "all") {
    await loadAllView();
    return;
  }

  if (button.dataset.action === "category") {
    await loadCategoryView(button.dataset.id, button.dataset.name);
  }
});

gamesTable.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-id]");
  const deleteButton = event.target.closest("[data-delete-id]");

  if (editButton) {
    fillForm(editButton.dataset.editId);
    return;
  }

  if (deleteButton) {
    const gameId = deleteButton.dataset.deleteId;
    const game = state.jogos.find((item) => Number(item.id) === Number(gameId)) || state.jogosVisiveis.find((item) => Number(item.id) === Number(gameId));

    if (!window.confirm(`Eliminar ${game ? game.nome : "este jogo"}?`)) {
      return;
    }

    try {
      const response = await fetch(`${api.jogos}/${gameId}`, { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Nao foi possivel eliminar.");
      }

      resetForm();
      setStatus("Jogo eliminado com sucesso.");
      await refreshCurrentView();
    } catch (error) {
      setStatus(error.message, true);
    }
  }
});

async function init() {
  try {
    setStatus("A carregar dados...");
    await loadCategorias();
    await loadJogos();
    await loadAllView();
    await loadJoinedPreview();
    setStatus("Pronto.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

init();
