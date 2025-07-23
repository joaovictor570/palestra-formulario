// -----------------------------------------
// FORMULÁRIO (index.html)
const form = document.getElementById("form-inscricao");
const mensagem = document.getElementById("mensagem");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nome = form.nome.value.trim();
    const telefone = form.telefone.value.trim();
    const setor = form.setor.value.trim();

    if (!nome || !telefone || !setor) {
      mensagem.textContent = "Preencha todos os campos.";
      return;
    }

    const telefoneValido = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/.test(telefone);
    if (!telefoneValido) {
      mensagem.textContent = "Digite um telefone válido (ex: 11912345678).";
      return;
    }

    try {
      const response = await fetch("/inscricao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome, telefone, setor }),
      });
      const result = await response.json();

      if (response.ok) {
        mensagem.textContent = "Inscrição realizada com sucesso!";
        mensagem.style.color = "cyan";
        form.reset();
      } else {
        mensagem.textContent = result.erro || "Erro ao enviar inscrição.";
      }
    } catch {
      mensagem.textContent = "Erro ao conectar com o servidor.";
    }
  });
}

// -----------------------------------------
// LISTA DE INSCRITOS (lista.html)
// -----------------------------------------
const listaEl = document.getElementById("lista-inscritos");

if (listaEl) {
  async function carregarLista() {
    const res = await fetch("/inscritos");
    const dados = await res.json();

    listaEl.innerHTML = "";
    dados.forEach((pessoa) => {
      const card = document.createElement("div");
      card.className = "card-participante";
      card.innerHTML = `
        <span class="nome">${pessoa.nome}</span>
        <br>
        <span class="setor">${pessoa.setor}</span>
      `;
      listaEl.appendChild(card);
    });

    if (dados.length >= 50) {
      const img = document.getElementById("imagem-final");
      if (img) img.style.display = "block";
    }
  }

  // ---------- Botão de sorteio ----------
  const btnSorteio = document.getElementById("btn-sorteio");
  const resultadoEl = document.getElementById("resultado-sorteio");

  if (btnSorteio) {
    btnSorteio.addEventListener("click", async () => {
      try {
        const res = await fetch("/sorteio");
        const data = await res.json();

        if (res.ok) {
          if (data.pessoa) {
            resultadoEl.innerHTML = `
              <h2>Número sorteado: ${data.numero}</h2>
              <p><strong>${data.pessoa.nome}</strong> — ${data.pessoa.setor}</p>
            `;
          } else {
            resultadoEl.innerHTML = `<h2>Número ${data.numero} ainda sem dono.</h2>`;
          }
        } else {
          resultadoEl.textContent = data.erro || "Erro no sorteio.";
        }
      } catch {
        resultadoEl.textContent = "Falha ao conectar ao servidor.";
      }
    });
  }

  carregarLista(); // carrega ao abrir
  setInterval(carregarLista, 5000); // recarrega se quiser
}

const btnRevelar = document.getElementById("btn-revelar");
const cobertura = document.getElementById("cobertura");

if (btnRevelar && cobertura) {
  btnRevelar.addEventListener("click", () => {
    cobertura.style.display = "flex";
  });
}

const btnFechar = document.getElementById("btn-fechar");

if (btnFechar && cobertura) {
  btnFechar.addEventListener("click", () => {
    cobertura.style.display = "none";
    btnfechar.style.display = "none";
  });
}
