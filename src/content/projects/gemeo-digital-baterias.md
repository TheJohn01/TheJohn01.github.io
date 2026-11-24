---
title: Gémeo digital de baterias
order: 1
tags: [Caso de estudo, Python, Simulação de baterias]
status: Publicado
art: battery
artLabel: Arte ASCII de duas células de bateria cilíndricas sobre uma base, à frente de um ecrã com duas curvas de envelhecimento e um limite de fim de vida a tracejado
summary: Quanto tempo dura a bateria de um carro elétrico? Compensa reaproveitá-la depois para guardar energia? E qual é a sua pegada de carbono? Construí um simulador que responde a estas perguntas para quatro tipos de baterias, a partir da forma como são usadas.
links:
  - label: Ver no GitHub
    href: https://github.com/TheJohn01/DigitalTwinBattery
  - label: Experimentar o dashboard
    href: https://battery-twin.streamlit.app/
caseStudy:
  findings:
    - value: 3×
      text: mais ciclos numa bateria LFP do que numa NMC antes de perder 20 % da capacidade (1227 contra 398)
    - value: ≈ 90 %
      text: da capacidade ainda disponível quando a bateria sai do carro, ao fim de 8 anos e 146 000 km
    - value: Depende
      text: "se a segunda vida compensa face a um sistema novo: entre +355 € e −262 €, conforme o preço da bateria usada"
    - value: ≈ −14 %
      text: de CO2 por kWh entregue face a um sistema novo, quando a pegada da bateria é repartida pelas duas vidas
---

## Porque fiz este projeto

A forma como uma bateria é usada decide quanto tempo dura: a rapidez com que carrega e descarrega, a temperatura e o arrefecimento. E a duração decide duas coisas que importam fora do laboratório:

- **o dinheiro:** quanta energia, e por isso quanta receita ou poupança, a bateria entrega antes de ser retirada;
- **o ambiente:** a pegada do fabrico fica fixa quando a bateria é feita. Uma bateria que dura o dobro reparte essa pegada pelo dobro da energia. É por isso que o regulamento europeu das baterias, (UE) 2023/1542, mede a pegada de carbono por kWh entregue ao longo da vida.

## O desafio: duas escalas de tempo

Um modelo físico de uma bateria simula uma carga ou uma descarga, que dura segundos a horas. A vida útil depende de milhares de ciclos, ao longo de anos. Correr o modelo físico durante a vida inteira é lento, e os seus mecanismos de envelhecimento têm muitos parâmetros que raramente estão publicados para uma célula comercial.

Por isso dividi o problema em três passos:

1. Simulo em detalhe alguns ciclos de carga e descarga, com um modelo físico da bateria.
2. A partir deles, estimo como a bateria perde capacidade ao longo dos anos, com modelos ajustados a ensaios publicados.
3. Com essa curva, calculo se o investimento compensa e qual é o impacto ambiental de cada kWh que a bateria entrega.

## As duas vidas de uma bateria

O gémeo digital acompanha a bateria de um carro elétrico em duas vidas:

1. **No carro:** condução e carregamento diários, incluindo carregamentos rápidos, verificados contra os limites de durabilidade da norma Euro 7.
2. **Em armazenamento:** depois de sair do carro, a bateria é reaproveitada para guardar energia e comparada com um sistema LFP novo, comprado no mesmo ano, em custo e em carbono.

Duas conclusões surpreenderam-me:

- **O carregamento rápido muda pouco** com um uso normal do carro: ao fim de 8 anos, uma bateria NMC passa de 89,9 % para 87,5 % da capacidade, mesmo que todos os carregamentos sejam rápidos.
- **A segunda vida é renhida no custo**, porque reaproveitar só poupa o pack de baterias, cerca de um quinto do custo de um sistema novo. No ambiente, porém, ganha: repartida pelas duas vidas, a pegada do fabrico por kWh entregue fica abaixo da de um sistema novo.

## O que o dashboard permite fazer

No [dashboard](https://battery-twin.streamlit.app/), qualquer pessoa pode:

- escolher a química (NMC, LFP, NCA ou iões de sódio), as velocidades de carga e descarga e a temperatura;
- definir o uso do carro: quilómetros por dia, anos de uso e parte de carregamentos rápidos;
- ver em linguagem simples se a bateria dura, se compensa, se a segunda vida vale a pena e qual é a pegada de carbono;
- comparar três usos da bateria: comprar e vender energia no mercado diário português, guardar a energia de painéis solares numa casa, ou reduzir a fatura de uma empresa;
- descarregar os relatórios económico e ambiental em PDF ou Word.

## Como o validei

- Comparei o modelo com medições de baterias comerciais reais: o erro na perda de capacidade fica abaixo de meio ponto percentual nas células usadas para o ajustar e perto de 2,6 pontos em células que nunca tinha visto.
- Sem o reajustar, previ o estado de baterias de carros reais: um VW ID.3 (94 % previsto, 98 % medido) e um Tesla Model 3 com 79 000 km (91–94 % previsto, 92 % medido).
- Acompanha também a perda de capacidade de 21 baterias domésticas reais.

## O que aprendi

- **Os modelos publicados precisavam de ser corrigidos.** O modelo original para baterias NCA sobrestimava a vida cerca de 12 vezes, e o de NMC tinha o efeito da temperatura ao contrário.
- **O laboratório não é o carro.** O modelo de laboratório envelhecia as baterias NMC cerca de três vezes mais depressa do que carros reais. São os dados reais de utilização que tornam um gémeo digital credível.
- **A química mais "verde" depende da duração.** Medida por kWh entregue, a pegada de LFP e NCA é a mais baixa nas condições por omissão (15,8 e 16,4 g de CO₂ equivalente), contra 25,3 g para NMC, embora o fabrico tenha pegadas semelhantes por kWh de capacidade.

## O que ainda não está bem

- **Frio:** o modelo é otimista. A 5 °C prevê mais energia do que as baterias reais entregam.
- **Ambiente:** é uma avaliação de ciclo de vida de triagem, com dados secundários, ao nível da célula e sem revisão crítica. Serve para comparar opções, não para afirmações públicas.
- **Economia:** repete um ano de preços horários durante todo o projeto e assume que se conhecem os preços do dia seguinte, por isso a receita do mercado é um limite superior.
- **Dados:** parte dos pontos de envelhecimento foi lida de figuras de artigos, o que acrescenta um erro de leitura de alguns por cento.

## Próximos passos

- Dados medidos da segunda vida de baterias NMC modernas de carros. Não encontrei nenhum conjunto de dados aberto.
- Física mais fiel a frio e a correntes altas, ajustada a ensaios da mesma célula.
- Um modelo de envelhecimento que preveja quedas súbitas de capacidade também para NMC e para descargas profundas.

<details>
<summary>Detalhes técnicos</summary>

- **Física:** modelos SPMe e DFN em PyBaMM, com modelo térmico concentrado e deposição de lítio no modelo NMC detalhado.
- **Envelhecimento:** modelos empíricos do BLAST-Lite (NREL) reajustados a 46 pontos de estudos publicados, a 81 células de Severson et al. (2019) e a duas células Samsung 50E; projeção até 20 000 ciclos.
- **Calibração NMC:** células LG M50T (Kirkaldy et al. 2024); perda de inventário de lítio com RMSE de 0,40 p.p. no treino e 2,56 p.p. em validação a 10 °C.
- **Economia e ambiente:** VAL, TIR, payback descontado e LCOS com preços horários do OMIE e tarifas da ERSE. ACV de triagem segundo a ISO 14040/14044, com a unidade funcional do Regulamento (UE) 2023/1542.
- **Estimação de estado:** filtro de Kalman estendido, com estimação da capacidade entre repousos. Nos ciclos simulados, erro de SOC até 2,6 pontos percentuais e de SOH cerca de 2 pontos. Num Tesla Model 3 real (LFP), segue o SOC a 3,1 pontos (RMS) a partir de um valor inicial errado, sem conhecer a perda de 9 % de capacidade. Num ano de um sistema doméstico real, segue cada dia a 2,3 pontos (mediana).
- **Física a correntes altas:** um fator de eletrólito ajustado a descargas de 2–3C da LG M50 reproduz a capacidade a 0,07 Ah e a temperatura de superfície a 3,8 K (RMS), de 1C a 5C entre 25 e 35 °C.
- **LFP:** o modelo inclui a queda súbita de capacidade ("joelho") com carregamento rápido, ajustada às curvas de Severson et al. (2019). Isso reduz para metade o erro de capacidade nas células medidas.
- **Pack:** dispersão de temperatura ao longo de um canal de arrefecimento e variação entre células, opcionalmente usadas na economia e na ACV.
- **Verificação:** a perda prevista é comparada com seis Smart e.d., um VW ID.3, um Tesla Model 3 e 21 sistemas domésticos, além dos ensaios de laboratório.

</details>

