const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")
let clickNumbers = 0
const triangles = []

// const trianglesModel = [
//     {
//         vertex: [ {x, y}, {x, y}, {x, y} ],
//         color: [ {r, g, b}, {r, g, b}, {r, g, b}]
//     },
//     {

//     }
// ]

// Triangle
// array de pontos
// objeto de cor
let triangle = {vertex: [], color: []}



if(!ctx) {
    alert('Your browser does not have canvas support or JS enabled!')
}

function drawTriangle() {
    triangles.forEach(t => {
        ctx.beginPath()
        ctx.moveTo(t.vertex[0].x, t.vertex[0].y) 
        ctx.lineTo(t.vertex[1].x, t.vertex[1].y)
        ctx.lineTo(t.vertex[2].x, t.vertex[2].y)
        ctx.lineTo(t.vertex[0].x, t.vertex[0].y)
        ctx.closePath()
        ctx.stroke()
    })
}

function drawSquare(x, y) {
    console.log(`drawing square at ${x} ${y} px`)
    ctx.fillStyle = `rgba(255, 0, 0, 1)`
    ctx.fillRect(x, y, 4, 4)
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    drawSquare(x, y)

    const coordinate = {x, y}
    if(clickNumbers == 0) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        triangle.color.push({r: 255, g: 0, b: 0})
        return;
    }
    if(clickNumbers == 1) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        triangle.color.push({r: 0, g: 255, b: 0})

        return
    }
    if(clickNumbers == 2) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        triangle.color.push({r: 0, g: 0, b: 255})

        clickNumbers=0
        triangles.push(triangle)
        
        drawTriangle()
        triangle = {vertex: [], color: []}
        return
    }
})

// window.addEventListener("load", draw
// AI MANO, DÁ UM GRAU!!!!