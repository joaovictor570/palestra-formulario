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

    // Validação básica
    if (!nome || !telefone || !setor) {
      mensagem.textContent = "Preencha todos os campos.";
      return;
    }

    // Validação de telefone (padrão brasileiro simples)
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
        form.nome.value = "";
        form.telefone.value = "";
        form.setor.value = "";
      } else {
        mensagem.textContent = result.erro || "Erro ao enviar inscrição.";
      }
    } catch (error) {
      mensagem.textContent = "Erro ao conectar com o servidor.";
    }
  });
}

// -----------------------------------------
// LISTA DE INSCRITOS (lista.html)
// -----------------------------------------

const listaEl = document.getElementById("lista-inscritos");

if (listaEl) {
  function carregarLista() {
    fetch("/inscritos")
      .then((res) => res.json())
      .then((dados) => {
        listaEl.innerHTML = "";

        const colunas = 10;
        const linhas = 5;
        const largura = 100; // pixels
        const altura = 100;

        dados.forEach((pessoa, index) => {
          const col = index % colunas;
          const row = Math.floor(index / colunas);
          const left = col * largura;
          const top = row * altura;

          const card = document.createElement("div");
          card.className = "card-participante";
          card.innerHTML = `
      <span class="nome">${pessoa.nome}</span>
      <span class="setor">${pessoa.setor}</span>
    `;

          // Posicionamento manual via estilo
          card.style.position = "absolute";
          card.style.left = `${left}px`;
          card.style.top = `${top}px`;
          card.style.width = `${largura}px`;
          card.style.height = `${altura}px`;

          listaEl.appendChild(card);
        });

        if (dados.length >= 50) {
          const imagem = document.getElementById("imagem-final");
          if (imagem) imagem.style.display = "block";
        }
      });
  }

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
      } catch (e) {
        resultadoEl.textContent = "Falha ao conectar ao servidor.";
      }
    });
  }

  carregarLista(); // chama ao abrir
  setInterval(carregarLista, 5000); // atualiza a cada 5s
}
