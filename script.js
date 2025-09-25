
// Cargar y graficar datos embebidos en datos.js
function graficar() {
    // Filtrar y mapear datos relevantes
    const paises = datos.map(d => d["Países"].trim());
    const esperanzaVida = datos.map(d => Number(d["Esperanza de vida"].replace(',', '.')));
    const gastoPerCapita = datos.map(d => Number(d["G. Público Salud Per Capita"].replace(/\./g, '').replace(',', '.')));
    const eficiencia = datos.map(d => Number(d["Eficiencia"].replace(',', '.')));


    // Ordenar por esperanza de vida
    const orden = esperanzaVida
        .map((ev, i) => ({ev, i}))
        .sort((a, b) => a.ev - b.ev)
        .map(obj => obj.i);

    const paisesOrdenados = orden.map(i => paises[i]);
    const esperanzaOrdenada = orden.map(i => esperanzaVida[i]);
    const gastoOrdenado = orden.map(i => gastoPerCapita[i]);


     // Rangos personalizados
    const rangos = [60, 65, 75, 80, 85];
    // Buscar el índice del país más cercano a cada rango
    const tickIndices = rangos.map(rango => {
        let minDiff = Infinity;
        let idx = 0;
        esperanzaOrdenada.forEach((ev, i) => {
            const diff = Math.abs(ev - rango);
            if (diff < minDiff) {
                minDiff = diff;
                idx = i;
            }
        });
        return idx;
    });

    // Usar los nombres de los países en esos índices como etiquetas
    const tickvals = tickIndices.map(i => paisesOrdenados[i]);
    const ticktext = rangos.map(r => r.toString());

    // Gráfico de barras
    const barras = {
        x: paisesOrdenados,
        y: gastoOrdenado,
        text: esperanzaOrdenada.map(ev => `Esperanza de vida: ${ev}`),
        type: 'bar',
        marker: {color: 'rgba(55,128,191,0.7)'},
        name: 'Gasto Salud Per Capita',
        hovertemplate: '%{text}<br>Esperanza de vida: %{x}<br>Gasto per cápita: %{y}<extra></extra>',
        width: 0.8
    };

    const layoutBarras = {
        title: 'Gasto Salud Per Capita vs Esperanza de Vida',
        xaxis: {
            title: 'Esperanza de vida',
            tickangle: 90,
            tickfont: {size: 10},
            tickvals: tickvals, // <-- Países más cercanos a cada rango
            ticktext: ticktext  // <-- Etiquetas de los rangos
        },
        yaxis: {title: 'Gasto Salud Per Capita'},
        legend: {x: 0.8, y: 1.1},
        bargap: 0.2
    };


    Plotly.newPlot('grafico', [barras], layoutBarras, {displayModeBar: false});

    // --- REGRESIÓN LINEAL PARA DISPERSIÓN ---
    function regresionLineal(x, y) {
        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumXY = x.reduce((acc, val, i) => acc + val * y[i], 0);
        const sumX2 = x.reduce((acc, val) => acc + val * val, 0);
        const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const b = (sumY - m * sumX) / n;
        // Generar puntos para la línea
        const xMin = Math.min(...x);
        const xMax = Math.max(...x);
        return {
            x: [xMin, xMax],
            y: [m * xMin + b, m * xMax + b],
            m, b
        };
    }

    const reg = regresionLineal(esperanzaOrdenada, gastoOrdenado);

    // Gráfico de dispersión
    const dispersion = {
        x: esperanzaOrdenada,
        y: gastoOrdenado,
        text: paisesOrdenados,
        mode: 'markers+text',
        type: 'scatter',
        marker: {
            size: 3, // <-- Ajusta el tamaño de los puntos aquí
            color: 'rgba(55,128,191,0.7)'
        },
        textposition: 'bottom center',
        name: 'País',
        hovertemplate: '%{text}<br>Esperanza de vida: %{x}<br>Gasto per cápita: %{y}<extra></extra>',
        textfont: {size: 5} // <-- Ajusta el tamaño de la letra de los nombres de los puntos aquí
    };

    // Línea de regresión
    const lineaRegresion = {
        x: reg.x,
        y: reg.y,
        type: 'scatter',
        mode: 'lines',
        name: 'Regresión lineal',
        line: {
            color: 'red', // <-- Ajusta el color de la línea aquí
            width: 2     // <-- Ajusta el grosor de la línea aquí
        }
    };

    const layoutDispersion = {
        title: 'Dispersión: Gasto Salud Per Capita vs Esperanza de Vida',
        xaxis: {title: 'Esperanza de vida', tickfont: {size: 7}}, // <-- Ajusta el tamaño de la letra del eje x aquí
        yaxis: {title: 'Gasto Salud Per Cápita (USD)', tickfont: {size: 7}, range: [0, Math.max(...gastoOrdenado)*1.1]}, // <-- Ajusta el tamaño de la letra del eje y aquí
        legend: {font: {size: 7}} // <-- Ajusta el tamaño de la letra de la leyenda aquí
    };

    Plotly.newPlot('grafico2', [dispersion, lineaRegresion], layoutDispersion, {displayModeBar: false});
}

window.onload = graficar;