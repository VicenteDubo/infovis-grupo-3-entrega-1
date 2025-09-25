    // --- Línea recta SVG entre cuadro destacado y gráfico 2 ---
    //setTimeout(() => {
        //const svg = document.getElementById('svg-recta');
        //if (svg) {
            //svg.innerHTML = '';
            // Coordenadas ajustadas para partir del centro del cuadro destacado sobre 80 años
            // x1: centro horizontal del rectángulo zona 80 años (aprox. 900)
            // y1: parte inferior del rectángulo (SVG top: 0)
            // x2: centro horizontal del gráfico 2 (1200/2 = 600)
            // y2: parte superior del gráfico 2 (SVG bottom: 80)
            //const x1 = 1115; // aún más a la derecha
            //const y1 = 45;   // más arriba (menor valor)
            //const x2 = 980;
            //const y2 = 240;
            //const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            //line.setAttribute('x1', x1);
            //line.setAttribute('y1', y1);
            //line.setAttribute('x2', x2);
            //line.setAttribute('y2', y2);
            //line.setAttribute('stroke', 'purple');
            //line.setAttribute('stroke-width', '4');
            //svg.appendChild(line)
       // }
   // }, 500);
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
    const eficienciaOrdenada = orden.map(i => eficiencia[i]);
    
    
    
    // Crear anotaciones separadas para cada país destacado
    const idxNauru = paisesOrdenados.indexOf('Nauru');
    const idxEstadosUnidos = paisesOrdenados.indexOf('Estados Unidos');
    const idxAlbania = paisesOrdenados.indexOf('Albania');
    // Colores personalizados para países destacados
    const destacados = ['Nauru', 'Estados Unidos', 'Albania'];
    const colorMorado = 'rgba(128,0,128,0.9)';
    const colorDefault = 'rgba(55,128,191,0.7)';
    const coloresBarras = paisesOrdenados.map(p => destacados.includes(p) ? colorMorado : colorDefault);
    // --- GRAFICO ZOOM: Países con esperanza de vida > 80 años ---
    const paisesZoom = [];
    const gastoZoom = [];
    const esperanzaZoom = [];
    for (let i = 0; i < paisesOrdenados.length; i++) {
        if (esperanzaOrdenada[i] > 80) {
            paisesZoom.push(paisesOrdenados[i]);
            gastoZoom.push(gastoOrdenado[i]);
            esperanzaZoom.push(esperanzaOrdenada[i]);
        }
    }

    // Colores para países con gasto < 2000 dólares y > 2000 igual que el principal
    const colorBajo = colorMorado; // naranja
    const coloresZoom = gastoZoom.map(g => g < 2000 ? colorBajo : colorDefault);

    const barrasZoom = {
        x: paisesZoom,
        y: gastoZoom,
        text: esperanzaZoom.map((ev, i) => `${paisesZoom[i]}<br>Esperanza de vida: ${ev}<br>Gasto per cápita: ${gastoZoom[i]}`),
        type: 'bar',
        marker: {color: coloresZoom},
        name: 'Zona > 80 años',
        hovertemplate: '%{text}<extra></extra>',
        width: 0.8
    };

    const layoutZoom = {
        title: 'Zoom: Países con Esperanza de Vida Mayor a 80 Años',
        xaxis: {
            title: 'Países ordenados por esperanza de vida',
            tickangle: 90,
            tickfont: {size:8},
            tickmode: 'array',
            tickvals: paisesZoom,
            ticktext: paisesZoom
        },
        yaxis: {title: 'Gasto Salud Per Capita (USD)'},
        bargap: 0.2
    };

    Plotly.newPlot('grafico-zoom', [barrasZoom], layoutZoom, {displayModeBar: false});


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
        text: esperanzaOrdenada.map((ev, i) => `${paisesOrdenados[i]}<br>Esperanza de vida: ${ev}<br>Gasto per cápita: ${gastoOrdenado[i]}`),
        type: 'bar',
        marker: {color: coloresBarras},
        name: 'Gasto Salud Per Capita',
        hovertemplate: '%{text}<extra></extra>',
        width: 0.8
    };


    const anotacionNauru = idxNauru !== -1 ? {
        x: 'Nauru',
        y: gastoOrdenado[idxNauru],
        xref: 'x',
        yref: 'y',
        text: `Nauru gasta <b>más que<br>el 84%</b> de los países,<br>pero tiene una<br>esperanza de vida<br>de solo ${esperanzaOrdenada[idxNauru]} años.`,
        showarrow: true,
        arrowhead: 6,
        ax: 0,
        ay: -90,
        font: {color: 'black', size: 9},
        align: 'left',
        bgcolor: '#fff',
        bordercolor: colorMorado,
        borderpad: 4
    } : null;

    const anotacionEstadosUnidos = idxEstadosUnidos !== -1 ? {
        x: 'Estados Unidos',
        y: gastoOrdenado[idxEstadosUnidos],
        xref: 'x',
        yref: 'y',
        text: `Estados Unidos gasta<br><b>65 veces más</b> que<br>Albania y tiene una<br>esperanza de vida peor.`,
        showarrow: true,
        arrowhead: 6,
        ax: 0,
        ay: -60,
        font: {color: 'black', size: 9},
        align: 'left',
        bgcolor: '#fff',
        bordercolor: colorMorado,
        borderpad: 4
    } : null;


    const anotacionAlbania = idxAlbania !== -1 ? {
        x: 'Albania',
        y: gastoOrdenado[idxAlbania],
        xref: 'x',
        yref: 'y',
        text: `Albania gasta <b>menos que<br>el 66%</b> de los países y<br>tiene <b>mejor</b> esperanza de<br>vida <b>que el 80%</b> de ellos.`,
        showarrow: true,
        arrowhead: 6,
        ax: 0,
        ay: -140,
        font: {color: 'black', size: 9},
        align: 'left',
        bgcolor: '#fff',
        bordercolor: colorMorado,
        borderpad: 4
    } : null;


    const anotaciones = [anotacionNauru, anotacionEstadosUnidos, anotacionAlbania].filter(a => a);

    // Calcular zona de esperanza de vida > 80 años
    const idx80 = esperanzaOrdenada.findIndex(ev => ev > 80);
    const idxMax = esperanzaOrdenada.length - 1;
    const x0 = paisesOrdenados[idx80];
    const x1 = paisesOrdenados[idxMax];
    const yMin = 0;
    const yMax = Math.max(...gastoOrdenado) * 1.05;

    // Shape para el rectángulo
    const shapeZona80 = {
        type: 'rect',
        xref: 'x',
        yref: 'y',
        x0: x0,
        x1: x1,
        y0: yMin,
        y1: yMax,
        fillcolor: 'rgba(200,200,255,0.2)',
        line: {color: 'rgba(128,0,128,0.7)', width: 0},
        layer: 'below'
    };

    // Anotación conectada al rectángulo
    // const anotacionZona80 = {
        //     x: x1,
        //     y: yMax,
        //     xref: 'x',
        //     yref: 'y',
        //     text: `Zona de Esperanza de Vida > 80 años`,
        //     showarrow: true,
        //     arrowhead: 6,
        //     ax:0,
        //     ay: -90,
        //     font: {color: 'black', size: 13},
        //     align: 'center',
        //     bgcolor: '#fff',
        //     bordercolor: 'rgba(128,0,128,0.7)',
        //     borderpad: 6
        // };
    const layoutBarras = {
        title: 'Gasto Salud Per Capita vs Esperanza de Vida por País',
        xaxis: {
            title: 'Países ordenados por esperanza de vida',
            tickangle: 0,
            tickfont: {size: 13},
            tickvals: tickvals, // <-- Países más cercanos a cada rango
            ticktext: ticktext  // <-- Etiquetas de los rangos
        },
        yaxis: {title: 'Gasto Salud Per Capita (USD)'},
        legend: {x: 0.8, y: 1.1},
        bargap: 0.2,
        annotations: [...anotaciones]
        //shapes: [shapeZona80]
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

    // Plotly.newPlot('grafico2', [dispersion, lineaRegresion], layoutDispersion, {displayModeBar: false});
}

window.onload = graficar;