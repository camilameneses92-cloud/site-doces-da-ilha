document.addEventListener("DOMContentLoaded", function () {

    /* =========================================
       ELEMENTOS DOS PRODUTOS
       ========================================= */

    const produtos = document.querySelectorAll(
        ".quantidade-pedido input"
    );

    const subtotalElemento =
        document.getElementById("subtotal");

    const descontoElemento =
        document.getElementById("desconto");

    const totalElemento =
        document.getElementById("total");


    /* =========================================
       ELEMENTOS DO CLIENTE
       ========================================= */

    const campoNome =
        document.getElementById("nome");

    const campoTelefone =
        document.getElementById("telefone");

    const mensagemFidelidade =
        document.getElementById("mensagem-fidelidade");


    /* =========================================
       ELEMENTOS DO PAGAMENTO
       ========================================= */

    const pagamentos =
        document.querySelectorAll(
            'input[name="pagamento"]'
        );

    const areaDinheiro =
        document.getElementById("area-dinheiro");

    const valorRecebido =
        document.getElementById("valor-recebido");

    const semTroco =
        document.getElementById("sem-troco");

    const valorTroco =
        document.getElementById("valor-troco");

    const mensagemValor =
        document.getElementById("mensagem-valor");


    /* =========================================
       ELEMENTO FINALIZAÇÃO
       ========================================= */

    const botaoFinalizar =
        document.getElementById("finalizar-pedido");


    /* =========================================
       ELEMENTOS DO MODAL DE RESUMO
       ========================================= */

    const modalResumo =
        document.getElementById("modal-resumo");

    const modalConfirmacao =
        document.getElementById("modal-confirmacao");

    const fecharResumo =
        document.getElementById("fechar-resumo");

    const voltarResumo =
        document.getElementById("voltar-resumo");

    const listaResumoProdutos =
        document.getElementById("lista-resumo-produtos");

    const resumoSubtotal =
        document.getElementById("resumo-subtotal");

    const resumoDesconto =
        document.getElementById("resumo-desconto");

    const resumoTotal =
        document.getElementById("resumo-total");

    const resumoNome =
        document.getElementById("resumo-nome");

    const resumoTelefone =
        document.getElementById("resumo-telefone");

    const resumoPagamento =
        document.getElementById("resumo-pagamento");

    const confirmarPedido =
        document.getElementById("confirmar-pedido");


    /* =========================================
       CLIENTE ATUAL
       ========================================= */

    let telefoneClienteAtual = "";


    /* =========================================
       FORMATAR MOEDA
       ========================================= */

    function formatarMoeda(valor) {

        return Number(valor).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );

    }


    /* =========================================
       LIMPAR TELEFONE
       ========================================= */

    function limparTelefone(telefone) {

        return String(telefone).replace(/\D/g, "");

    }


    /* =========================================
       OBTER DADOS DO CLIENTE
       ========================================= */

    function obterDadosCliente(telefone) {

        const telefoneLimpo =
            limparTelefone(telefone);

        if (!telefoneLimpo) {

            return {
                compras: 0,
                descontoDisponivel: false
            };

        }


        const chave =
            "cliente_" + telefoneLimpo;

        const dados =
            localStorage.getItem(chave);


        if (!dados) {

            return {
                compras: 0,
                descontoDisponivel: false
            };

        }


        try {

            const cliente =
                JSON.parse(dados);

            return {

                compras:
                    Number(cliente.compras) || 0,

                descontoDisponivel:
                    cliente.descontoDisponivel === true

            };

        } catch (erro) {

            console.error(
                "Erro ao ler os dados do cliente:",
                erro
            );

            return {

                compras: 0,
                descontoDisponivel: false

            };

        }

    }


    /* =========================================
       SALVAR DADOS DO CLIENTE
       ========================================= */

    function salvarDadosCliente(
        telefone,
        dados
    ) {

        const telefoneLimpo =
            limparTelefone(telefone);

        if (!telefoneLimpo) {
            return;
        }


        const chave =
            "cliente_" + telefoneLimpo;


        localStorage.setItem(
            chave,
            JSON.stringify(dados)
        );

    }


    /* =========================================
       OBTER SUBTOTAL
       ========================================= */

    function obterSubtotal() {

        let subtotal = 0;

        produtos.forEach(function (produto) {

            const quantidade =
                Number(produto.value) || 0;

            const preco =
                Number(produto.dataset.preco) || 0;


            subtotal +=
                quantidade * preco;

        });


        return subtotal;

    }


    /* =========================================
       OBTER DESCONTO
       ========================================= */

    function obterDescontoCliente(subtotal) {

        if (
            !telefoneClienteAtual ||
            subtotal <= 0
        ) {

            return 0;

        }


        const cliente =
            obterDadosCliente(
                telefoneClienteAtual
            );


        if (
            cliente.descontoDisponivel
        ) {

            return subtotal * 0.05;

        }


        return 0;

    }


    /* =========================================
       MOSTRAR STATUS DA FIDELIDADE
       ========================================= */

    function atualizarFidelidade() {

        if (!mensagemFidelidade) {
            return;
        }


        const telefone =
            limparTelefone(
                campoTelefone
                    ? campoTelefone.value
                    : ""
            );


        /* Telefone ainda incompleto */

        if (telefone.length < 11) {

            mensagemFidelidade.textContent =
                "";

            mensagemFidelidade.classList.remove(
                "fidelidade-ativa"
            );

            return;

        }


        const cliente =
            obterDadosCliente(telefone);


        /* Cliente possui desconto */

        if (cliente.descontoDisponivel) {

            mensagemFidelidade.textContent =
                "🎉 Você possui 5% de desconto nesta compra!";

            mensagemFidelidade.classList.add(
                "fidelidade-ativa"
            );

        }


        /* Cliente ainda não possui desconto */

        else {

            const compras =
                cliente.compras;


            if (compras === 0) {

                mensagemFidelidade.textContent =
                    "Primeira compra registrada neste telefone.";

            }

            else if (compras === 1) {

                mensagemFidelidade.textContent =
                    "Você já realizou 1 compra. Faltam 2 compras para liberar seu desconto.";

            }

            else if (compras === 2) {

                mensagemFidelidade.textContent =
                    "Você já realizou 2 compras. Na próxima compra você terá 5% de desconto.";

            }

            else {

                mensagemFidelidade.textContent =
                    "Continue comprando para aproveitar seus benefícios.";

            }


            mensagemFidelidade.classList.remove(
                "fidelidade-ativa"
            );

        }

    }


    /* =========================================
       CALCULAR PEDIDO
       ========================================= */

    function calcularPedido() {

        const subtotal =
            obterSubtotal();


        const desconto =
            obterDescontoCliente(
                subtotal
            );


        const total =
            subtotal - desconto;


        if (subtotalElemento) {

            subtotalElemento.textContent =
                formatarMoeda(subtotal);

        }


        if (descontoElemento) {

            descontoElemento.textContent =
                formatarMoeda(desconto);

        }


        if (totalElemento) {

            totalElemento.textContent =
                formatarMoeda(total);

        }


        calcularTroco();

    }


    /* =========================================
       CALCULAR TROCO
       ========================================= */

    function calcularTroco() {

        if (
            !valorRecebido ||
            !valorTroco
        ) {

            return;

        }


        const pagamentoSelecionado =
            document.querySelector(
                'input[name="pagamento"]:checked'
            );


        /* Não é pagamento em dinheiro */

        if (
            !pagamentoSelecionado ||
            pagamentoSelecionado.value !== "dinheiro"
        ) {

            valorTroco.textContent =
                formatarMoeda(0);


            if (mensagemValor) {

                mensagemValor.textContent = "";

            }


            return;

        }


        const subtotal =
            obterSubtotal();


        const desconto =
            obterDescontoCliente(
                subtotal
            );


        const total =
            subtotal - desconto;


        /* Cliente não precisa de troco */

        if (
            semTroco &&
            semTroco.checked
        ) {

            valorTroco.textContent =
                formatarMoeda(0);


            if (mensagemValor) {

                mensagemValor.textContent = "";

            }


            return;

        }


        /* Campo vazio */

        if (
            valorRecebido.value === ""
        ) {

            valorTroco.textContent =
                formatarMoeda(0);


            if (mensagemValor) {

                mensagemValor.textContent = "";

            }


            return;

        }


        const recebido =
            Number(valorRecebido.value);


        /* Valor inválido */

        if (isNaN(recebido)) {

            valorTroco.textContent =
                formatarMoeda(0);


            if (mensagemValor) {

                mensagemValor.textContent =
                    "Informe um valor válido.";

            }


            return;

        }


        /* Valor insuficiente */

        if (recebido < total) {

            valorTroco.textContent =
                formatarMoeda(0);


            if (mensagemValor) {

                mensagemValor.textContent =
                    "O valor recebido é menor que o total do pedido.";

            }


            return;

        }


        /* Calcular troco */

        const troco =
            recebido - total;


        valorTroco.textContent =
            formatarMoeda(troco);


        if (mensagemValor) {

            mensagemValor.textContent = "";

        }

    }


    /* =========================================
       EVENTOS DOS PRODUTOS
       ========================================= */

    produtos.forEach(function (produto) {

        produto.addEventListener(
            "input",
            calcularPedido
        );

        produto.addEventListener(
            "change",
            calcularPedido
        );

    });


    /* =========================================
       TELEFONE
       ========================================= */

    if (campoTelefone) {

        campoTelefone.addEventListener(
            "input",
            function () {

                let numeros =
                    limparTelefone(
                        campoTelefone.value
                    );


                /* Limitar a 11 números */

                numeros =
                    numeros.substring(0, 11);


                /* Formatar telefone */

                let telefoneFormatado = "";


                if (numeros.length > 0) {

                    telefoneFormatado =
                        "(" +
                        numeros.substring(0, 2);

                }


                if (numeros.length >= 3) {

                    telefoneFormatado +=
                        ") " +
                        numeros.substring(2, 7);

                }


                if (numeros.length >= 8) {

                    telefoneFormatado +=
                        "-" +
                        numeros.substring(7, 11);

                }


                campoTelefone.value =
                    telefoneFormatado;


                /* Guardar telefone atual */

                telefoneClienteAtual =
                    numeros;


                /* Verificar fidelidade automaticamente */

                atualizarFidelidade();


                /* Recalcular desconto */

                calcularPedido();

            }
        );

    }
        /* =========================================
       PAGAMENTO
       ========================================= */

    pagamentos.forEach(function (pagamento) {

        pagamento.addEventListener(
            "change",
            function () {

                if (
                    pagamento.value === "dinheiro"
                ) {

                    if (areaDinheiro) {

                        areaDinheiro.hidden =
                            false;

                        areaDinheiro.style.display =
                            "block";

                    }

                }
                else {

                    if (areaDinheiro) {

                        areaDinheiro.hidden =
                            true;

                        areaDinheiro.style.display =
                            "none";

                    }


                    if (valorRecebido) {

                        valorRecebido.value =
                            "";

                    }


                    if (semTroco) {

                        semTroco.checked =
                            false;

                    }


                    if (valorTroco) {

                        valorTroco.textContent =
                            formatarMoeda(0);

                    }


                    if (mensagemValor) {

                        mensagemValor.textContent =
                            "";

                    }

                }


                calcularTroco();

            }
        );

    });


    /* =========================================
       VALOR RECEBIDO
       ========================================= */

    if (valorRecebido) {

        valorRecebido.addEventListener(
            "input",
            calcularTroco
        );

    }


    /* =========================================
       NÃO PRECISO DE TROCO
       ========================================= */

    if (semTroco) {

        semTroco.addEventListener(
            "change",
            function () {

                if (semTroco.checked) {

                    if (valorRecebido) {

                        valorRecebido.value =
                            "";

                    }


                    if (valorTroco) {

                        valorTroco.textContent =
                            formatarMoeda(0);

                    }


                    if (mensagemValor) {

                        mensagemValor.textContent =
                            "";

                    }

                }


                calcularTroco();

            }
        );

    }


    /* =========================================
       FINALIZAR PEDIDO
       ========================================= */

    if (botaoFinalizar) {

        botaoFinalizar.addEventListener(
            "click",
            function () {

                /* ==============================
                   VERIFICAR PRODUTOS
                   ============================== */

                const quantidadeTotal =
                    Array.from(produtos).reduce(
                        function (total, produto) {

                            return total +
                                (Number(produto.value) || 0);

                        },
                        0
                    );


                if (quantidadeTotal <= 0) {

                    alert(
                        "Selecione pelo menos um produto para continuar."
                    );

                    return;

                }


                /* ==============================
                   VERIFICAR NOME
                   ============================== */

                const nome =
                    campoNome
                        ? campoNome.value.trim()
                        : "";


                if (!nome) {

                    alert(
                        "Informe seu nome completo."
                    );


                    if (campoNome) {

                        campoNome.focus();

                    }


                    return;

                }


                /* ==============================
                   VERIFICAR TELEFONE
                   ============================== */

                const telefone =
                    campoTelefone
                        ? limparTelefone(
                            campoTelefone.value
                        )
                        : "";


                if (!telefone) {

                    alert(
                        "Informe seu telefone."
                    );


                    if (campoTelefone) {

                        campoTelefone.focus();

                    }


                    return;

                }


                if (telefone.length !== 11) {

                    alert(
                        "Informe um telefone válido com DDD."
                    );


                    if (campoTelefone) {

                        campoTelefone.focus();

                    }


                    return;

                }


                telefoneClienteAtual =
                    telefone;


                /* ==============================
                   VERIFICAR PAGAMENTO
                   ============================== */

                const pagamentoSelecionado =
                    document.querySelector(
                        'input[name="pagamento"]:checked'
                    );


                if (!pagamentoSelecionado) {

                    alert(
                        "Selecione uma forma de pagamento para continuar."
                    );

                    return;

                }


                /* ==============================
                   VERIFICAR DINHEIRO
                   ============================== */

                if (
                    pagamentoSelecionado.value ===
                    "dinheiro"
                ) {

                    const subtotal =
                        obterSubtotal();


                    const desconto =
                        obterDescontoCliente(
                            subtotal
                        );


                    const total =
                        subtotal - desconto;


                    const recebido =
                        Number(
                            valorRecebido
                                ? valorRecebido.value
                                : 0
                        );


                    if (
                        semTroco &&
                        !semTroco.checked &&
                        (
                            !valorRecebido ||
                            valorRecebido.value === "" ||
                            isNaN(recebido) ||
                            recebido < total
                        )
                    ) {

                        alert(
                            "Informe um valor recebido válido para calcular o troco."
                        );


                        if (valorRecebido) {

                            valorRecebido.focus();

                        }


                        return;

                    }

                }


                /* ==============================
                   PREENCHER RESUMO
                   ============================== */

                preencherResumo();


                /* ==============================
                   ABRIR RESUMO
                   ============================== */

                abrirResumo();

            }
        );

    }


    /* =========================================
       PREENCHER RESUMO DO PEDIDO
       ========================================= */

    function preencherResumo() {

        if (!listaResumoProdutos) {

            return;

        }


        listaResumoProdutos.innerHTML = "";


        produtos.forEach(function (produto) {

            const quantidade =
                Number(produto.value) || 0;


            if (quantidade <= 0) {

                return;

            }


            const artigo =
                produto.closest(
                    ".produto-pedido"
                );


            if (!artigo) {

                return;

            }


            const nomeElemento =
                artigo.querySelector("h3");


            const nome =
                nomeElemento
                    ? nomeElemento.textContent.trim()
                    : "Produto";


            const preco =
                Number(
                    produto.dataset.preco
                ) || 0;


            const subtotalProduto =
                quantidade * preco;


            const item =
                document.createElement("div");


            item.className =
                "item-resumo-produto";


            item.innerHTML = `
                <div>
                    <strong>${nome}</strong>
                    <span>
                        ${quantidade} × ${formatarMoeda(preco)}
                    </span>
                </div>

                <strong>
                    ${formatarMoeda(subtotalProduto)}
                </strong>
            `;


            listaResumoProdutos.appendChild(
                item
            );

        });


        /* ==============================
           VALORES
           ============================== */

        const subtotal =
            obterSubtotal();


        const desconto =
            obterDescontoCliente(
                subtotal
            );


        const total =
            subtotal - desconto;


        if (resumoSubtotal) {

            resumoSubtotal.textContent =
                formatarMoeda(subtotal);

        }


        if (resumoDesconto) {

            resumoDesconto.textContent =
                formatarMoeda(desconto);

        }


        if (resumoTotal) {

            resumoTotal.textContent =
                formatarMoeda(total);

        }


        /* ==============================
           CLIENTE
           ============================== */

        if (resumoNome) {

            resumoNome.textContent =
                campoNome
                    ? campoNome.value.trim()
                    : "";

        }


        if (resumoTelefone) {

            resumoTelefone.textContent =
                campoTelefone
                    ? campoTelefone.value
                    : "";

        }


        /* ==============================
           FORMA DE PAGAMENTO
           ============================== */

        const pagamentoSelecionado =
            document.querySelector(
                'input[name="pagamento"]:checked'
            );


        if (resumoPagamento) {

            if (pagamentoSelecionado) {

                const nomesPagamento = {

                    pix: "Pix",
                    cartao: "Cartão",
                    dinheiro: "Dinheiro"

                };


                resumoPagamento.textContent =
                    nomesPagamento[
                        pagamentoSelecionado.value
                    ] ||
                    pagamentoSelecionado.value;

            }
            else {

                resumoPagamento.textContent =
                    "Não informado";

            }

        }

    }


    /* =========================================
       MODAL DE RESUMO
       ========================================= */

    function abrirResumo() {

        if (!modalResumo) {

            return;

        }


        modalResumo.hidden =
            false;


        document.body.style.overflow =
            "hidden";

    }


    function fecharJanelaResumo() {

        if (!modalResumo) {

            return;

        }


        modalResumo.hidden =
            true;


        document.body.style.overflow =
            "";

    }


    /* =========================================
       BOTÃO FECHAR DO RESUMO
       ========================================= */

    if (fecharResumo) {

        fecharResumo.addEventListener(
            "click",
            fecharJanelaResumo
        );

    }


    /* =========================================
       BOTÃO VOLTAR DO RESUMO
       ========================================= */

    if (voltarResumo) {

        voltarResumo.addEventListener(
            "click",
            fecharJanelaResumo
        );

    }


    /* =========================================
       CLICAR FORA DO RESUMO
       ========================================= */

    if (modalResumo) {

        modalResumo.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target === modalResumo
                ) {

                    fecharJanelaResumo();

                }

            }
        );

    }


    /* =========================================
       CONFIRMAR PEDIDO
       ========================================= */

    if (confirmarPedido) {

        confirmarPedido.addEventListener(
            "click",
            function () {

                const telefone =
                    limparTelefone(
                        campoTelefone
                            ? campoTelefone.value
                            : ""
                    );


                const nome =
                    campoNome
                        ? campoNome.value.trim()
                        : "";


                const pagamentoSelecionado =
                    document.querySelector(
                        'input[name="pagamento"]:checked'
                    );


                /* ==============================
                   CALCULAR VALORES
                   ============================== */

                const subtotal =
                    obterSubtotal();


                const desconto =
                    obterDescontoCliente(
                        subtotal
                    );


                const total =
                    subtotal - desconto;


                /* ==============================
                   DADOS DO MODAL DE CONFIRMAÇÃO
                   ============================== */

                const confirmacaoNome =
                    document.getElementById(
                        "confirmacao-nome"
                    );


                const confirmacaoTelefone =
                    document.getElementById(
                        "confirmacao-telefone"
                    );


                const confirmacaoSubtotal =
                    document.getElementById(
                        "confirmacao-subtotal"
                    );


                const confirmacaoDesconto =
                    document.getElementById(
                        "confirmacao-desconto"
                    );


                const confirmacaoTotal =
                    document.getElementById(
                        "confirmacao-total"
                    );


                const confirmacaoPagamento =
                    document.getElementById(
                        "confirmacao-pagamento"
                    );


                const listaConfirmacao =
                    document.getElementById(
                        "lista-confirmacao"
                    );


                const confirmacaoTrocoContainer =
                    document.getElementById(
                        "confirmacao-troco-container"
                    );


                const confirmacaoTroco =
                    document.getElementById(
                        "confirmacao-troco"
                    );


                /* ==============================
                   NOME E TELEFONE
                   ============================== */

                if (confirmacaoNome) {

                    confirmacaoNome.textContent =
                        nome;

                }


                if (confirmacaoTelefone) {

                    confirmacaoTelefone.textContent =
                        campoTelefone
                            ? campoTelefone.value
                            : "";

                }


                /* ==============================
                   VALORES
                   ============================== */

                if (confirmacaoSubtotal) {

                    confirmacaoSubtotal.textContent =
                        formatarMoeda(subtotal);

                }


                if (confirmacaoDesconto) {

                    confirmacaoDesconto.textContent =
                        formatarMoeda(desconto);

                }


                if (confirmacaoTotal) {

                    confirmacaoTotal.textContent =
                        formatarMoeda(total);

                }


                /* ==============================
                   FORMA DE PAGAMENTO
                   ============================== */

                if (
                    confirmacaoPagamento &&
                    pagamentoSelecionado
                ) {

                    const nomesPagamento = {

                        pix: "Pix",
                        cartao: "Cartão",
                        dinheiro: "Dinheiro"

                    };


                    confirmacaoPagamento.textContent =
                        nomesPagamento[
                            pagamentoSelecionado.value
                        ] ||
                        pagamentoSelecionado.value;

                }


                /* ==============================
                   TROCO
                   ============================== */

                if (confirmacaoTrocoContainer) {

                    confirmacaoTrocoContainer.hidden =
                        true;

                }


                if (
                    pagamentoSelecionado &&
                    pagamentoSelecionado.value ===
                        "dinheiro" &&
                    semTroco &&
                    !semTroco.checked &&
                    valorRecebido &&
                    valorRecebido.value !== ""
                ) {

                    const recebido =
                        Number(
                            valorRecebido.value
                        );


                    const troco =
                        recebido - total;


                    if (confirmacaoTroco) {

                        confirmacaoTroco.textContent =
                            formatarMoeda(troco);

                    }


                    if (confirmacaoTrocoContainer) {

                        confirmacaoTrocoContainer.hidden =
                            false;

                    }

                }


                /* ==============================
                   PRODUTOS DA CONFIRMAÇÃO
                   ============================== */

                if (listaConfirmacao) {

                    listaConfirmacao.innerHTML =
                        "";


                    produtos.forEach(
                        function (produto) {

                            const quantidade =
                                Number(
                                    produto.value
                                ) || 0;


                            if (quantidade <= 0) {

                                return;

                            }


                            const artigo =
                                produto.closest(
                                    ".produto-pedido"
                                );


                            if (!artigo) {

                                return;

                            }


                            const nomeElemento =
                                artigo.querySelector(
                                    "h3"
                                );


                            const nomeProduto =
                                nomeElemento
                                    ? nomeElemento
                                        .textContent
                                        .trim()
                                    : "Produto";


                            const preco =
                                Number(
                                    produto.dataset.preco
                                ) || 0;


                            const subtotalProduto =
                                quantidade * preco;


                            const item =
                                document.createElement(
                                    "div"
                                );


                            item.className =
                                "item-confirmacao";


                            item.innerHTML = `
                                <div>
                                    <strong>
                                        ${nomeProduto}
                                    </strong>

                                    <span>
                                        ${quantidade} ×
                                        ${formatarMoeda(preco)}
                                    </span>
                                </div>

                                <strong>
                                    ${formatarMoeda(
                                        subtotalProduto
                                    )}
                                </strong>
                            `;


                            listaConfirmacao
                                .appendChild(item);

                        }
                    );

                }
                    /* ==============================
                   OBTER CLIENTE
                   ============================== */

                const cliente =
                    obterDadosCliente(
                        telefone
                    );


                /* ==============================
                   REGISTRAR FIDELIDADE
                   ============================== */

                if (
                    cliente.descontoDisponivel
                ) {

                    /*
                     * O desconto disponível
                     * foi utilizado nesta compra.
                     */

                    cliente.descontoDisponivel =
                        false;

                }
                else {

                    /*
                     * Registrar nova compra.
                     */

                    cliente.compras =
                        Number(
                            cliente.compras
                        ) + 1;


                    /*
                     * Após completar 3 compras,
                     * liberar desconto para
                     * a próxima compra.
                     */

                    if (
                        cliente.compras >= 3
                    ) {

                        cliente.descontoDisponivel =
                            true;

                    }

                }


                /* ==============================
                   SALVAR CLIENTE
                   ============================== */

                salvarDadosCliente(
                    telefone,
                    cliente
                );


                /* ==============================
                   FECHAR RESUMO
                   ============================== */

                fecharJanelaResumo();


                /* ==============================
                   ABRIR CONFIRMAÇÃO
                   ============================== */

                if (modalConfirmacao) {

                    modalConfirmacao.hidden =
                        false;

                    document.body.style.overflow =
                        "hidden";

                }


                /* ==============================
                   LIMPAR PRODUTOS
                   ============================== */

                produtos.forEach(
                    function (produto) {

                        produto.value = 0;

                    }
                );


                /* ==============================
                   LIMPAR CLIENTE
                   ============================== */

                if (campoNome) {

                    campoNome.value = "";

                }


                if (campoTelefone) {

                    campoTelefone.value = "";

                }


                telefoneClienteAtual = "";


                if (mensagemFidelidade) {

                    mensagemFidelidade.textContent =
                        "";

                    mensagemFidelidade.classList.remove(
                        "fidelidade-ativa"
                    );

                }


                /* ==============================
                   LIMPAR PAGAMENTO
                   ============================== */

                pagamentos.forEach(
                    function (pagamento) {

                        pagamento.checked =
                            false;

                    }
                );


                if (valorRecebido) {

                    valorRecebido.value =
                        "";

                }


                if (semTroco) {

                    semTroco.checked =
                        false;

                }


                if (valorTroco) {

                    valorTroco.textContent =
                        formatarMoeda(0);

                }


                if (mensagemValor) {

                    mensagemValor.textContent =
                        "";

                }


                /* ==============================
                   ESCONDER ÁREA DE DINHEIRO
                   ============================== */

                if (areaDinheiro) {

                    areaDinheiro.hidden =
                        true;

                    areaDinheiro.style.display =
                        "none";

                }


                /* ==============================
                   RECALCULAR PEDIDO
                   ============================== */

                calcularPedido();

            }
        );

    }


    /* =========================================
       BOTÕES DA CONFIRMAÇÃO
       ========================================= */

    const botaoNovoPedido =
        document.getElementById(
            "novo-pedido"
        );

    const botaoFecharConfirmacao =
        document.getElementById(
            "fechar-confirmacao"
        );


    /* =========================================
       FECHAR CONFIRMAÇÃO
       ========================================= */

    function fecharModalConfirmacao() {

        if (!modalConfirmacao) {

            return;

        }


        modalConfirmacao.hidden =
            true;


        document.body.style.overflow =
            "";

    }


    /* =========================================
       BOTÃO FECHAR
       ========================================= */

    if (botaoFecharConfirmacao) {

        botaoFecharConfirmacao.addEventListener(
            "click",
            function () {

                fecharModalConfirmacao();

            }
        );

    }


    /* =========================================
       FAZER NOVO PEDIDO
       ========================================= */

    if (botaoNovoPedido) {

        botaoNovoPedido.addEventListener(
            "click",
            function () {

                fecharModalConfirmacao();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

            }
        );

    }


    /* =========================================
       FECHAR CONFIRMAÇÃO CLICANDO FORA
       ========================================= */

    if (modalConfirmacao) {

        modalConfirmacao.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    modalConfirmacao
                ) {

                    fecharModalConfirmacao();

                }

            }
        );

    }


    /* =========================================
       INICIALIZAÇÃO — PEDIDOS
       ========================================= */

    if (areaDinheiro) {

        areaDinheiro.hidden =
            true;

        areaDinheiro.style.display =
            "none";

    }


    calcularPedido();


    /* =========================================
       TELEFONE — ENCOMENDAS
       ========================================= */

    const telefoneEncomenda =
        document.getElementById(
            "telefone-encomenda"
        );


    if (telefoneEncomenda) {

        telefoneEncomenda.addEventListener(
            "input",
            function () {

                let numeros =
                    telefoneEncomenda.value.replace(
                        /\D/g,
                        ""
                    );


                numeros =
                    numeros.substring(
                        0,
                        11
                    );


                let telefoneFormatado =
                    "";


                if (numeros.length > 0) {

                    telefoneFormatado =
                        "(" +
                        numeros.substring(
                            0,
                            2
                        );

                }


                if (numeros.length >= 3) {

                    telefoneFormatado +=
                        ") " +
                        numeros.substring(
                            2,
                            7
                        );

                }


                if (numeros.length >= 8) {

                    telefoneFormatado +=
                        "-" +
                        numeros.substring(
                            7,
                            11
                        );

                }


                telefoneEncomenda.value =
                    telefoneFormatado;

            }
        );

    }


    /* =========================================
       FINALIZAÇÃO — ENCOMENDAS
       ========================================= */

    const formularioEncomenda =
        document.getElementById(
            "form-encomenda"
        );

    const modalEncomenda =
        document.getElementById(
            "modal-encomenda"
        );

    const fecharModalEncomenda =
        document.getElementById(
            "fechar-modal-encomenda"
        );


    if (formularioEncomenda) {

        formularioEncomenda.addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();


                if (
                    !formularioEncomenda.checkValidity()
                ) {

                    formularioEncomenda.reportValidity();

                    return;

                }


                if (modalEncomenda) {

                    modalEncomenda.hidden =
                        false;

                    document.body.style.overflow =
                        "hidden";

                }


                formularioEncomenda.reset();

            }
        );

    }


    /* =========================================
       FECHAR MODAL — ENCOMENDAS
       ========================================= */

    function fecharJanelaEncomenda() {

        if (!modalEncomenda) {

            return;

        }


        modalEncomenda.hidden =
            true;


        document.body.style.overflow =
            "";

    }


    if (fecharModalEncomenda) {

        fecharModalEncomenda.addEventListener(
            "click",
            fecharJanelaEncomenda
        );

    }


    /* =========================================
       FECHAR ENCOMENDA CLICANDO FORA
       ========================================= */

    if (modalEncomenda) {

        modalEncomenda.addEventListener(
            "click",
            function (evento) {

                if (
                    evento.target ===
                    modalEncomenda
                ) {

                    fecharJanelaEncomenda();

                }

            }
        );

    }

});