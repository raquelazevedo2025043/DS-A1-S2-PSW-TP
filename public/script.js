const API_BASE = window.location.protocol === "file:" ? "http://localhost:3008" : "";

const api = {
  categorias: `${API_BASE}/api/categorias`,
  categoria: (id) => `${API_BASE}/api/categorias/${id}`,
  jogos: `${API_BASE}/api/jogos`,
  jogo: (id) => `${API_BASE}/api/jogos/${id}`,
  jogosComCategoria: `${API_BASE}/api/jogos-categorias`,
  jogosDaCategoria: (id) => `${API_BASE}/api/categorias/${id}/jogos`
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

const categoryForm = document.querySelector("#category-form");
const categoryIdInput = document.querySelector("#category-id");
const categoryNameInput = document.querySelector("#category-name");
const categorySaveButton = document.querySelector("#category-save-button");
const categoryCancelButton = document.querySelector("#category-cancel-button");
const categoryStatusText = document.querySelector("#category-status");
const categoriesTable = document.querySelector("#categories-table");

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

function setCategoryStatus(message, isError = false) {
  categoryStatusText.textContent = message;
  categoryStatusText.style.color = isError ? "#c93838" : "var(--muted)";
}

function formatPrice(value) {
  return Number(value).toFixed(2) + " EUR";
}

function getCategoriaNome(idCategoria) {
  const categoria = state.categorias.find((item) => Number(item.id) === Number(idCategoria));
  return categoria ? categoria.nome : "Sem categoria";
}

function renderCategoriaSelect() {
  const selectedValue = categoriaSelect.value;

  if (!state.categorias.length) {
    categoriaSelect.innerHTML = '<option value="">Sem categorias</option>';
    return;
  }

  categoriaSelect.innerHTML = state.categorias
    .map((categoria) => `<option value="${categoria.id}">${categoria.nome}</option>`)
    .join("");

  if (selectedValue && state.categorias.some((categoria) => String(categoria.id) === selectedValue)) {
    categoriaSelect.value = selectedValue;
  }
}

function renderCategoriesTable() {
  if (!state.categorias.length) {
    categoriesTable.innerHTML = '<tr><td class="empty" colspan="3">Sem categorias.</td></tr>';
    return;
  }

  categoriesTable.innerHTML = state.categorias
    .map((categoria) => `
      <tr>
        <td>${categoria.id}</td>
        <td>${categoria.nome}</td>
        <td>
          <div class="row-actions">
            <button type="button" class="btn btn-secondary" data-category-edit-id="${categoria.id}">Editar</button>
            <button type="button" class="btn btn-danger" data-category-delete-id="${categoria.id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `)
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
    gamesTable.innerHTML = '<tr><td class="empty" colspan="5">Sem registos para mostrar.</td></tr>';
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
    joinedList.innerHTML = '<div class="empty">Sem dados.</div>';
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

function resetGameForm() {
  form.reset();
  gameIdInput.value = "";
  saveButton.textContent = "Guardar";
}

function resetCategoryForm() {
  categoryForm.reset();
  categoryIdInput.value = "";
  categorySaveButton.textContent = "Guardar categoria";
}

function fillGameForm(gameId) {
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

function fillCategoryForm(categoryId) {
  const category = state.categorias.find((item) => Number(item.id) === Number(categoryId));

  if (!category) {
    setCategoryStatus("Nao foi possivel localizar a categoria.", true);
    return;
  }

  categoryIdInput.value = String(category.id);
  categoryNameInput.value = category.nome;
  categorySaveButton.textContent = "Atualizar categoria";
  setCategoryStatus(`A editar categoria: ${category.nome}`);
}

async function loadCategorias() {
  const response = await fetch(api.categorias);
  if (!response.ok) {
    throw new Error("Nao foi possivel carregar as categorias.");
  }

  state.categorias = await response.json();
  renderCategoriaSelect();
  renderChips();
  renderCategoriesTable();
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
    state.filtroAtual = { tipo: "category", id: Number(id), nome: `Jogos: ${nome}` };
    renderChips();
    renderGamesTable([]);
    return;
  }

  const items = await response.json();
  state.filtroAtual = { tipo: "category", id: Number(id), nome: `Jogos: ${nome}` };
  renderChips();
  renderGamesTable(items);
}

async function refreshAllData() {
  await loadCategorias();
  await loadJogos();

  if (state.filtroAtual.tipo === "category") {
    const category = state.categorias.find((item) => Number(item.id) === Number(state.filtroAtual.id));
    if (category) {
      await loadCategoryView(category.id, category.nome);
    } else {
      await loadAllView();
    }
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
  const url = gameId ? api.jogo(gameId) : api.jogos;

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

    resetGameForm();
    setStatus(method === "POST" ? "Jogo criado com sucesso." : "Jogo atualizado com sucesso.");
    await refreshAllData();
  } catch (error) {
    setStatus(error.message, true);
  }
});

categoryForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const nome = categoryNameInput.value.trim();
  const categoryId = categoryIdInput.value;

  if (!nome) {
    setCategoryStatus("Escreve o nome da categoria.", true);
    return;
  }

  const method = categoryId ? "PUT" : "POST";
  const url = categoryId ? api.categoria(categoryId) : api.categorias;

  try {
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.erro || "Nao foi possivel guardar a categoria.");
    }

    resetCategoryForm();
    setCategoryStatus(method === "POST" ? "Categoria criada com sucesso." : "Categoria atualizada com sucesso.");
    await refreshAllData();
  } catch (error) {
    setCategoryStatus(error.message, true);
  }
});

cancelButton.addEventListener("click", () => {
  resetGameForm();
  setStatus("Edicao cancelada.");
});

categoryCancelButton.addEventListener("click", () => {
  resetCategoryForm();
  setCategoryStatus("Edicao de categoria cancelada.");
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
    fillGameForm(editButton.dataset.editId);
    return;
  }

  if (deleteButton) {
    const gameId = deleteButton.dataset.deleteId;
    const game = state.jogos.find((item) => Number(item.id) === Number(gameId))
      || state.jogosVisiveis.find((item) => Number(item.id) === Number(gameId));

    if (!window.confirm(`Eliminar ${game ? game.nome : "este jogo"}?`)) {
      return;
    }

    try {
      const response = await fetch(api.jogo(gameId), { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Nao foi possivel eliminar.");
      }

      resetGameForm();
      setStatus("Jogo eliminado com sucesso.");
      await refreshAllData();
    } catch (error) {
      setStatus(error.message, true);
    }
  }
});

categoriesTable.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-category-edit-id]");
  const deleteButton = event.target.closest("[data-category-delete-id]");

  if (editButton) {
    fillCategoryForm(editButton.dataset.categoryEditId);
    return;
  }

  if (deleteButton) {
    const categoryId = deleteButton.dataset.categoryDeleteId;
    const category = state.categorias.find((item) => Number(item.id) === Number(categoryId));

    if (!window.confirm(`Eliminar categoria ${category ? category.nome : "selecionada"}?`)) {
      return;
    }

    try {
      const response = await fetch(api.categoria(categoryId), { method: "DELETE" });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.erro || "Nao foi possivel eliminar a categoria.");
      }

      if (Number(categoryId) === Number(categoryIdInput.value)) {
        resetCategoryForm();
      }

      setCategoryStatus("Categoria eliminada com sucesso.");
      await refreshAllData();
    } catch (error) {
      setCategoryStatus(error.message, true);
    }
  }
});

async function init() {
  try {
    setStatus("A carregar dados...");
    await refreshAllData();
    setStatus("Pronto.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

init();
