---
title: Do CO2 capturado ao metanol
order: 3
tags: [Aspen Plus, Aprendizagem automática]
status: Em curso
art: plant
artLabel: "Arte ASCII de uma maqueta de instalação: uma coluna de pratos (instalação 1), dois tanques (instalação 2), uma esfera que representa o modelo de aprendizagem automática e um permutador de placas (instalação 3), ligados por tubagens"
summary: Três instalações simuladas em Aspen Plus e integradas numa só unidade. Um modelo de aprendizagem automática treinado com os resultados vai alimentar um site onde qualquer alteração aos dados de entrada dá uma resposta fiável.
---

## O objetivo

Transformar CO₂ capturado de gases de combustão em metanol, um combustível e uma matéria-prima da indústria química. A unidade junta três instalações, cada uma simulada em Aspen Plus:

1. **Captura de CO₂** com aminas, a partir dos gases de combustão;
2. **Produção de hidrogénio**, por eletrólise ou por reforma de biometano;
3. **Síntese de metanol** a partir do CO₂ e do hidrogénio.

A base de projeto é capturar 100 t de CO₂ por dia, com 90 % de captura. Isso pede cerca de 13,7 t de hidrogénio por dia.

## A primeira instalação: captura com aminas

Os gases de combustão passam numa coluna (o absorvedor) onde uma solução de amina, a frio, absorve o CO₂. A solução carregada segue para uma segunda coluna (o stripper), onde é aquecida para libertar o CO₂ quase puro e voltar ao início. O calor gasto nesse aquecimento é o maior custo de operação da captura.

Estou a comparar três solventes:

- **MEA**, a referência da indústria, rápida mas exigente em calor;
- **AMP**, uma amina que transporta mais CO₂ por molécula;
- **MDEA ativada com piperazina**, que gasta menos calor mas é a mais difícil de simular.

Antes de simular, reuni as reações e a cinética de cada solvente, com a fonte de cada parâmetro. Confirmei vários contra as correlações originais e assinalei os que não consegui confirmar numa fonte aberta.

## Simulação rigorosa, respostas imediatas

Uma simulação rigorosa das colunas pode demorar minutos por caso. Para que qualquer pessoa possa mudar os dados de entrada e ter uma resposta na hora, o Aspen vai alimentar um modelo de aprendizagem automática:

1. **Gerar dados.** Um programa em Python controla o Aspen e corre uma campanha de 150 casos de treino e 25 de validação, espalhados pela gama de operação. Repete casos que falham, filtra resultados incoerentes e retoma depois de uma interrupção.
2. **Treinar.** Um modelo por resultado (processos gaussianos) aprende a relação entre as entradas e as saídas.
3. **Servir.** Uma aplicação web mostra as previsões.

As entradas são o teor de CO₂ que fica no solvente regenerado, a pressão do stripper, a concentração de amina e o CO₂ no gás de combustão. As saídas incluem o calor gasto por tonelada de CO₂, o caudal de solvente e a potência de compressão do CO₂.

## Como garanto respostas fiáveis

- **Sem extrapolação escondida:** a aplicação só aceita valores dentro da gama simulada.
- **Incerteza em cada previsão:** cada resultado vem com um intervalo de confiança de 95 %.
- **Avisos:** se um ponto estiver longe dos dados de treino, por exemplo numa zona onde o Aspen não convergiu, a aplicação avisa.
- **Validação independente:** os casos de validação nunca entram no treino. O modelo só é aceite com um erro médio de até 3 % no calor gasto e se os intervalos de 95 % contiverem pelo menos 80 % dos valores reais.

## Em que ponto está

- **Pronto:** o código de geração de dados, treino e aplicação, testado com um Aspen simulado (31 testes automáticos).
- **Pronto:** o procedimento para validar o modelo termodinâmico do MEA contra 31 medições publicadas, com o critério de aceitação definido antes de ver os resultados.
- **Em rascunho:** a especificação das correntes de CO₂ e de hidrogénio entre as três instalações (pressão, temperatura e pureza).
- **Em curso:** a simulação do MEA no Aspen Plus, a começar por essa validação.

O modelo que está hoje na aplicação é de demonstração, treinado com dados sintéticos. Os resultados reais chegam quando as simulações estiverem concluídas.

## Próximas fases

- Simular as instalações de hidrogénio e de metanol.
- Integrar o calor entre as três instalações: o reator de metanol liberta calor que pode servir o stripper da captura.
- Encadear os três modelos pelas correntes que as instalações trocam, e propagar a incerteza de uma para a outra.

<details>
<summary>Detalhes técnicos</summary>

- **Termodinâmica:** ENRTL-RK com componentes verdadeiros e química de equilíbrio. Validação contra Wagner et al. (2013), MEA a 30 % entre 313 e 392 K, com critério AARD ≤ 30 % na pressão parcial de CO₂.
- **Colunas:** RadFrac em modo rate-based, com filme líquido discretizado com reação. Reações rápidas em equilíbrio e passos limitantes cinéticos, em lei de potência e base molaridade.
- **Cinética:** MEA com Hikita et al. (1977) e Pinsent et al. (1956), verificados a 25 °C contra as correlações originais (+2,4 % e +1,5 %). AMP com um ajuste de Arrhenius meu aos quatro pontos de Saha et al. (1995), com resíduos abaixo de 1 %. MDEA com Ko e Li (2000) e piperazina com Bishnoi e Rochelle (2000).
- **Dados e modelo:** amostragem por hipercubo latino, automação do Aspen por COM, processos gaussianos com kernel de Matérn, um modelo por saída.
- **Interface (proposta):** CO₂ entregue a 55 bar e 40 °C, com pelo menos 99,5 % de pureza e até 10 ppm de O₂. Hidrogénio a 55 bar, 99,9 %, com o mesmo limite de O₂. Com 57 kWh/kg, o eletrolisador precisa de cerca de 33 MW.

</details>

