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
  howItWorks:
    - Simulo em detalhe alguns ciclos de carga e descarga, com um modelo físico da bateria.
    - A partir deles, estimo como a bateria perde capacidade ao longo dos anos, com modelos ajustados a ensaios publicados.
    - Com essa curva, calculo se o investimento compensa e qual é o impacto ambiental de cada kWh que a bateria entrega.
  findings:
    - value: 3×
      text: mais ciclos numa bateria LFP do que numa NMC antes de perder 20 % da capacidade (1227 contra 398)
    - value: ≈ 90 %
      text: da capacidade ainda disponível quando a bateria sai do carro, ao fim de 8 anos e 146 000 km
    - value: Depende
      text: "se a segunda vida compensa face a um sistema novo: entre +355 € e −262 €, conforme o preço da bateria usada"
    - value: ≈ −14 %
      text: de CO2 por kWh entregue face a um sistema novo, quando a pegada da bateria é repartida pelas duas vidas
  validation:
    - "Comparei o modelo com medições de baterias comerciais reais: o erro na perda de capacidade fica abaixo de meio ponto percentual nas células usadas para o ajustar e perto de 2,6 pontos em células que nunca tinha visto."
    - "Sem o reajustar, previ o estado de baterias de carros reais: um VW ID.3 (94 % previsto, 98 % medido) e um Tesla Model 3 com 79 000 km (91–94 % previsto, 92 % medido)."
    - Acompanha também a perda de capacidade de 21 baterias domésticas reais.
  limitations:
    - "Com frio, o modelo é otimista: a 5 °C prevê mais energia do que as baterias reais entregam."
    - O modelo de laboratório envelhecia as baterias NMC cerca de três vezes mais depressa do que em carros reais; corrigi-o com dados de uma frota.
  technical:
    - "Física: modelos SPMe e DFN em PyBaMM, com modelo térmico concentrado e deposição de lítio no modelo NMC detalhado."
    - "Envelhecimento: modelos empíricos do BLAST-Lite (NREL) reajustados a 46 pontos de estudos publicados, a 81 células de Severson et al. (2019) e a duas células Samsung 50E; projeção até 20 000 ciclos."
    - "Calibração NMC com células LG M50T (Kirkaldy et al. 2024): perda de inventário de lítio com RMSE de 0,40 p.p. no treino e 2,56 p.p. em validação a 10 °C."
    - "Economia: VAL, TIR, payback descontado e LCOS com preços horários do OMIE e tarifas da ERSE. Ambiente: ACV de triagem segundo a ISO 14040/14044, com a unidade funcional do Regulamento (UE) 2023/1542."
    - "Estimação de estado: filtro de Kalman estendido para SOC e SOH, como um sistema de gestão de bateria."
---

<!-- Texto longo para a futura página deste projeto. Ainda não é mostrado no site. -->
