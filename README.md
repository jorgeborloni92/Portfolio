# Portfólio Jorge Borloni — edição 03

Código-fonte do portfólio de Jorge Borloni, edição 03: navegação inferior, seis cases S.T.A.R. e espaços de mídia. Os arquivos editáveis estão na raiz. `python3 build.py` monta o site nas pastas `public/` e `dist/`. Não requer instalação de bibliotecas. Salvar no GitHub não altera automaticamente a hospedagem pública anterior.

## Conteúdo e mídias

Os textos ficam em `content.json`. Cada projeto possui contexto, desafios, Situação, Tarefa, Ação, Resultado, aprendizados e detalhes complementares. Os textos da edição anterior foram preservados. FGTS e Gamificação receberam detalhes recuperados do Framer.

Cada projeto tem dois espaços de mídia preparados: diagnóstico e ação. Para preenchê-los, edite a lista `media` do projeto:

- `stage`: etapa em que a mídia aparece (`s`, `t`, `a` ou `r`).
- `type`: `image`, `video` ou `gallery`.
- `src`: caminho da imagem ou vídeo, por exemplo `/assets/meu-projeto.mp4`, ou uma URL HTTPS direta do arquivo. Deixar vazio mantém o espaço reservado.
- `title` e `caption`: título e legenda.
- `alt`: descrição da imagem para acessibilidade.
- `poster`: imagem de capa opcional para o vídeo.
- `items`: para galerias, lista de objetos com `src` e `alt`.

As imagens desta versão ficam na raiz do repositório. O gerador organiza esses arquivos em `public/assets/`. Para novas mídias, acrescente o nome à lista de arquivos no início de `build.py`, ou use uma URL HTTPS direta em `content.json`. Vídeos usam os controles nativos do navegador, sem reprodução automática. Uma URL de página do YouTube não é uma URL direta de vídeo; use um arquivo MP4/WebM ou peça a inclusão de um player incorporado. Links para protótipos ficam no campo `prototype`.

Não há painel de upload: esses espaços são preenchidos na edição do site e publicados depois. Você também pode enviar as mídias nesta conversa, indicando o case e o momento da história em que entram.

## Prévia local

Na pasta do projeto, execute `python3 build.py` e depois `python3 -m http.server 4183 --bind 127.0.0.1 --directory public`. Abra `http://127.0.0.1:4183/`.

## Referências da revisão

- Conteúdo: https://jorgeborloni.framer.website/works/antecipacao-fgts e https://jorgeborloni.framer.website/works/hackathon-gamification
- Navegação: https://m2.material.io/design/navigation/
- Hierarquia de leitura: https://www.nngroup.com/articles/layer-cake-pattern-scanning/

As referências visuais da edição anterior e os créditos das fotografias continuam na página `/creditos/`. Os frames do Figma não foram atualizados nesta edição.
