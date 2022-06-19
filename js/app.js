const estadoURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
const poblacion = 'apportionment.csv'
let fids = 'fids.json'

let estadoData
let poblacionData
let fid
let pop = []
//para referenciar svg con id = canvas
const canvas = d3.select("#canvas")
const estadoSeleccionado = d3.select("#estado-seleccionado")
const color = d3.scaleLog().range(['#f0edf5', '#045a8d'])

// Range steps
const años = [
  "1910",
  "1920",
  "1930",
  "1940",
  "1950",
  "1960",
  "1970",
  "1980",
  "1990",
  "2000",
  "2010",
  "2020",
]

// Select
const etiquetaAño = document.getElementById('año-seleccionado')
const selectorRango = document.getElementById('selector-ano')
let selectedYear = '1910'
etiquetaAño.innerText='1910'
selectorRango.addEventListener("change", evt => {
  const value = evt.target.value

  // - Substract -1 because steps array is 0 index
  // - 1000 is the input's max value
  const stepInRange = Math.round(((años.length - 1) / 1000) * value);
  const selectedStep = años[stepInRange];
  etiquetaAño.innerText = selectedStep
  selectedYear = selectedStep
  calculaMapa()
})

const path = canvas.selectAll("path").style('width', '300px')
function dibujaMapa () {
  console.log(pop)
  //se empieza a dibujar el mapa, agregando los paths, geoPath convierte el path a geojson
  color.domain([d3.min(pop), d3.max(pop)])
  path
    .data(estadoData)
    .enter()
    .append("path")
    .attr("d", d3.geoPath()) // d:el conjunto de coordenadas
    .attr("class", "estado")
    .attr("fill", (estadoDataItem => {
      let id = estadoDataItem['id']
      let fid_estado = fid[id.toString()]
      let estado = poblacionData.find((item) => {
        return (item['Name'] === fid_estado & (item['Year'] === selectedYear))
      })
      //se convierte a entero para manejar el numero de habitantes
      let habitantes = parseInt(estado['Resident Population'].replace(/,/g, ""));
      return color(habitantes)
    }))

  // interactividad con el mouse
    .on('mouseover', function (d, i) {
      estadoSeleccionado.text(d3.select(this).text())
    })
    .on('mouseout', function (d, i) {
      estadoSeleccionado.text('')
    })

  // generando el tooltip
    .append("title")
    .text((d) => {
      let id = d['id']
      let fid_estado = fid[id.toString()]
      let estado = poblacionData.find((item) => item['Name'] === fid_estado & (item['Year'] === selectedYear))
      let habitantes = estado['Resident Population']
      return (fid_estado + "\n" + habitantes)
    })
}

function calculaMapa() {
  d3.csv(poblacion).then((data, error) => {
    if (error) return console.error("Error: " + log)
    poblacionData = data
    Object.entries(poblacionData).forEach(([key, value]) => {
      if (value['Year'] === selectedYear) {
        pop.push(parseInt(value['Resident Population'].replace(/,/g, "")))
      }
    })
    d3.json(fids).then((data, error) => {
      if (error) return console.error('E:', error)
      fid = data
      dibujaMapa()
    })
  })
}

d3.json(estadoURL).then((data, error) => {
  if (error) return console.error(log)
  //convierte topojson a geoson formato, y solo se seleccionan los features que son los que nos dan las coor
  estadoData = topojson.feature(data, data.objects.states).features
  calculaMapa()
})
