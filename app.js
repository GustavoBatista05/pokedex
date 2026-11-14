const {
    createApp,
    ref,
    computed,
    onMounted
} = Vue;

createApp({
    setup() {
        const pokemons = ref([]);
        const pagina = ref(1);
        const total = ref(0);
        const carregando = ref(false);
        const busca = ref('');
        const erro = ref('');
        const detalhes = ref(null);
        const pokemonSelecionado = ref(null);

        const limite = 20;
        const totalPaginas = computed(() => Math.ceil(total.value / limite));
        const filtrados = computed(() => pokemons.value.filter(()=> p.name.includes(busca.value.trim().toLoweCase())));

        function idDaURL(url) {
            const partes = url.split('/').filter(Boolean);
            return Number(partes.at(-1));
        }

        function imagem(id) {
            return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
        }

        async function carregar() {
            carregando.value = true;
            erro.value = '';

            try {
                const offset = (pagina.value - 1) * limite;
                const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limite}&offset${offset}`)
                if(!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
                const dados = await resposta.json();
                total.value = dados.count;
                pokemons.value = dados.results.map(p => ({
                    ...p,
                    id: idDaURL(p.url)
                }));

              } catch(e) {
                    erro.value = `Não foi possivel carregar: ${e.message}`;
                    pokemons.value = [];

                  } finally {
                        carregando.value = false;
            }
        }

        function mudarPagina(delta) {
            const nova = pagina.value + delta;
            if(nova < 1 || nova > totalPaginas.value || carregando.value) return;
            pagina.value = nova;
            busca.value = '';
            carregar();
        }

        async function abrirDetalhes(id) {
            const resposta = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
            pokemonSelecionado.value = await resposta.json();
            detalhes.value.showModal();
        }

        function fecharDetalhes() {
            detalhes.value.close();
        }

        function tocarSom(pokemon) {
            const url = pokemon.cries?.latest ?? pokemon.cries.legacy;
            if(!url) return;
            const audio = new Audio(url);
            audio.play().catch(console.error);
        }

        onMounted(carregar);
        return {
            pokemons,
            busca,
            pagina,
            totalPaginas,
            carregando,
            erro,
            filtrados,
            detalhes,
            pokemonSelecionado,
            imagem,
            carregar,
            mudarPagina,
            abrirDetalhes,
            fecharDetalhes,
            tocarSom
        }
    }
}).mount('#app')