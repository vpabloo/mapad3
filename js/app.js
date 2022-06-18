let estadoURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json"
let poblacion = 'apportionment.csv'
let fids = 'fids.json'

let estadoData
let poblacionData
let fid
let pop = []
//para referenciar svg con id = canvas
let canvas = d3.select("#canvas")
let tooltip = d3.select("#tooltip")

const color = d3
    .scaleLog()
    .range(["#B3E5FC", "#01579B"])

// Range steps
const steps = [
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

const stepsOutput = document.getElementById('steps-output-element')
const stepsRange = document.getElementById('steps-range-element')
let year = '1910'
stepsOutput.innerText='1910'
stepsRange.addEventListener("change", evt => {
    const value = evt.target.value

    // - Substract -1 because steps array is 0 index
    // - 1000 is the input's max value
    const stepInRange = Math.round(((steps.length - 1) / 1000) * value);
    const selectedStep = steps[stepInRange];
    stepsOutput.innerText = selectedStep
    year = selectedStep
    // document.getElementById("canvas").innerHTML=""
    dibuja()
})
const path = canvas.selectAll("path")
const drawMap = () => {
    //se empieza a dibujar el mapa, agregando los paths, geoPath convierte el path a geojson
    color.domain([d3.min(pop), d3.max(pop)])
    console.log(color(100000))
    path.remove()
        .data(estadoData)
        .enter()
        .append("path")
        .attr("d", d3.geoPath()) // d:el conjunto de coordenadas
        .attr("class", "estado")
        .attr("fill", (estadoDataItem => {
            let id = estadoDataItem['id']
            let fid_estado = fid[id.toString()]
            //console.log(fid_estado)
            let estado = poblacionData.find((item) => {
                return (item['Name'] === fid_estado & (item['Year'] === year))
            })
            console.log(estado['Resident Population'])
            //se convierte a entero para manejar el numero de habitantes
            let habitantes = parseInt(estado['Resident Population'].replace(/,/g, ""));
            console.log(fid_estado)
            console.log(color(habitantes))
            return color(habitantes)
        }))
        //generando el tooltip
        .append("title")
        .text((d) => {
            tooltip.transition()
                .style('visibility', 'visible')
            console.log(d)
            let id = d['id']
            console.log('id', id)
            let fid_estado = fid[id.toString()]
            //console.log(fid_estado)
            let estado = poblacionData.find((item) => {
                return (item['Name'] === fid_estado & (item['Year'] === year))
            })
            //console.log(estado['Resident Population'])
            let habitantes = estado['Resident Population']
            //console.log(habitantes)
            return (fid_estado + "\n" + habitantes)
        })
}

let d3loadata
d3.json(estadoURL).then(
    (data, error) => {
        if (error) {
            console.log(log)
        } else {
            d3loadata = data
            dibuja()
        }
    }
)

function dibuja() {
    const data = d3loadata
    console.log(data)
    //convierte topojson a geoson formato, y solo se seleccionan los features que son los que nos dan las coor
    estadoData = topojson.feature(data, data.objects.states).features
    console.log(estadoData)
    d3.csv(poblacion).then(
        (data, error) => {
            if (error) {
                console.log("error: " + log)
            } else {
                //console.log(fids)
                poblacionData = data
                console.log(poblacionData)
                Object.entries(poblacionData).forEach(([key, value]) => {
                    console.log(value)
                    if (value['Year'] === year)
                        pop.push(parseInt(value['Resident Population'].replace(/,/g, "")))
                })
                console.log(pop)
                d3.json(fids).then(
                    (data, error) => {
                        if (error) {
                            console.log(error)
                        } else {
                            console.log(data)
                            fid = data
                            drawMap()
                        }
                    }
                )
            }
        }
    )
}