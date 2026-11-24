---
title: Heatpump-Pinch
order: 2
tags: [Python, CoolProp, Análise pinch]
status: Publicado
art: pinch
artLabel: Arte ASCII das curvas compostas quente e fria em forma de tubos sobre um par de eixos, unidas por barras onde há recuperação de calor, com uma esfera no pinch e uma bomba de calor ligada através dele
summary: Uma ferramenta em Python que mostra onde uma bomba de calor de alta temperatura pode reaproveitar calor num processo industrial, e quanta energia isso poupa. Validei-a com casos de referência da literatura.
links:
  - label: Ver no GitHub
    href: https://github.com/TheJohn01/Heatpump-Pinch
  - label: Experimentar a aplicação
    href: https://heatpump-pinch.streamlit.app
---

## O problema

Na indústria alimentar e de bebidas, quase todo o calor de processo é preciso abaixo dos 150 °C: pasteurização, limpeza, evaporação, secagem, brassagem e fervura do mosto. Hoje, esse calor ainda vem sobretudo de caldeiras a gás.

Uma bomba de calor pode fornecer parte dele com eletricidade, entregando várias unidades de calor por cada unidade de eletricidade. Mas só compensa em duas condições: o processo tem de ter calor para dar e calor para receber às temperaturas certas, e a eletricidade gasta tem de custar menos do que o gás poupado.

## O que fiz

Construí em Python uma cadeia única, que vai da tabela de correntes de um processo até à resposta económica:

1. **Metas de energia.** Com análise pinch, calculo quanto calor o processo precisa, quanto rejeita e a que temperaturas.
2. **Bombas de calor.** Coloco-as onde fazem sentido: tiram calor de onde o processo o rejeita e entregam-no onde o processo precisa.
3. **Fluidos reais.** Calculo o rendimento de cada bomba de calor com fluidos frigorigéneos reais e verifico os limites práticos e o regulamento europeu dos gases fluorados.
4. **A fábrica como está.** Parto da rede de permutadores que a fábrica já tem, não de um projeto ideal, para que as poupanças sejam as que o dono da fábrica veria.
5. **Economia.** Calculo investimento, retorno, valor atual líquido e CO₂ evitado com preços de energia de Portugal.

O mesmo cálculo corre na linha de comandos, nos testes e numa aplicação web que qualquer pessoa pode experimentar.

## O caso principal: uma cervejeira

Apliquei a ferramenta a uma cervejeira publicada (Padullés et al., 2026), com 1 milhão de hectolitros por ano e os preços de energia de Portugal do 1.º semestre de 2026.

- **Primeiro, recuperar calor.** A poupança mais barata não é uma bomba de calor: levar o condensado para o tanque de água quente poupa 7,2 % do gás por 0,06 M€, com retorno em 1,1 anos.
- **Uma bomba de calor compensa.** A de água quente (até 82 °C) leva a poupança a **66 % do gás atual**, com retorno do investimento em 4,3 anos, e evita 1441 t de CO₂ por ano.
- **A outra não.** A bomba de calor para a fervura do mosto (103 °C) nunca se paga aos preços atuais, porque a subida de temperatura é grande e o rendimento baixa.

Conclusão: uma cervejeira consegue eletrificar cerca de dois terços do gás de forma económica, mas não todo. Para eletrificar tudo seria preciso um preço de CO₂ ou uma tecnologia de alta temperatura mais barata.

## Quão sólida é a resposta

Os 66 % dependem de três dados: a relação entre o preço da eletricidade e o do gás, o rendimento da caldeira e a poupança no frio que a bomba de calor substitui. Com os preços do 2.º semestre de 2025, ou com uma caldeira mais eficiente, a resposta cai para 0 %. Por isso, a resposta honesta é um intervalo (0 a 66 %), não um número.

Numa simulação de Monte Carlo, com investimento e preços incertos, a bomba de calor de água quente tem 88 % de probabilidade de dar lucro em 10 anos e 59 % de se pagar em 5 anos.

## Como a validei

Cada passo é comparado com uma resposta conhecida:

- reproduz as metas de energia publicadas da cervejeira, de um evaporador de leite e de um secador por atomização, dentro do arredondamento;
- dá os mesmos resultados que uma biblioteca independente (OpenPinch), até à sexta casa decimal, em 11 casos;
- o modelo das bombas de calor fica entre +0,1 % e +6,5 % dos rendimentos publicados;
- 333 testes automáticos correm a cada alteração.

Pelo caminho encontrei um erro num material de ensino e incoerências em três artigos. Reporto-os em vez de os esconder nos resultados.

## O que ainda não está bem

- **Poucos dados medidos.** Os casos vêm de publicações. O único conjunto de dados medidos, de uma fábrica de laticínios, não tem o necessário para validar o rendimento das bombas de calor.
- **Regime estacionário.** A cervejeira é tratada como se trabalhasse sempre igual, porque o horário de produção não está publicado.
- **Custos preliminares.** São estimativas de nível conceptual, com a incerteza própria dessa fase.
- **Rede de permutadores simplificada.** Não divide correntes nem dimensiona o lado da carcaça dos permutadores.

<details>
<summary>Detalhes técnicos</summary>

- **Metas:** Problem Table Algorithm com contribuições ΔT individuais por corrente, curvas compostas e grande curva composta (GCC); vários níveis de utilidades; processos não contínuos por fatias de tempo.
- **ΔTmin:** supertargeting de área, unidades e custo anual total; ótimo de 0,6 K, e qualquer valor entre 0,08 e 2 K fica a 1 % do mínimo.
- **Bombas de calor:** COP por eficiência de Lorenz e por ciclos de compressão de vapor em CoolProp (andar simples, permutador na linha de aspiração, expansor, dois andares, cascata); triagem de fluidos com os limites do IEA HPT Annex 58 e o Regulamento (UE) 2024/573; verificação em TESPy; recompressão mecânica de vapor.
- **Redes:** diagnóstico da rede existente (calor através do pinch), síntese com número mínimo de unidades (20 de 20 instâncias de Letsios et al., 2018) e dimensionamento de permutadores de carcaça e tubos (Polley e Panjeh Shahi, 1991).
- **Economia:** VAL a 10 anos com taxa de 5 %, TIR, retorno simples, classes de estimativa AACE, cenários de apoios portugueses e rácio de equilíbrio eletricidade/gás (3,59 para a bomba de calor de água quente).

</details>

