

// -----------------------------------------
// FORMULÁRIO (index.html)
// -----------------------------------------

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
        listaEl.innerHTML = ""; // limpa antes de recriar
        dados.forEach((pessoa) => {
          const card = document.createElement("div");
          card.className = "card-participante";
          card.style.backgroundColor = getRandomColor();
          card.innerHTML = `
            <span class="nome">${pessoa.nome}</span>
            <span class="setor">${pessoa.setor}</span>
          `;
          listaEl.appendChild(card);
        });

        if (dados.length >= 50) {
          const imagem = document.getElementById("imagem-final");
          if (imagem) imagem.style.display = "block";
        }
      })
      .catch(() => {
        listaEl.innerHTML = "<p>Erro ao carregar inscritos.</p>";
      });
  }

  carregarLista(); // chama ao abrir
  setInterval(carregarLista, 5000); // atualiza a cada 5s
}
