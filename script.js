const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")

ctx.globalCompositeOperation = "source-over";

let id = 0
let clickNumbers = 0
let triangles = []
let triangle = {id, vertex: [], intersections: new Map(), edgeColor: {}, minY: 999, maxY: 0}

const triangleList = document.querySelector(".triangleList")

function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}
  
function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

if(!ctx) {
    alert('Your browser does not have canvas support or JS enabled!')
}

const clearButton = document.querySelector(".clearButton")
clearButton.addEventListener("click", (e) => clearCanvas(true))

function clearCanvas () {
    triangleList.innerHTML = ""
    triangles = []
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function defineIntersections (triangle) {
    const minY = triangle.minY
    const maxY = triangle.maxY

    for (let c = minY; c < maxY; c++) {
        triangle.intersections.set(c, [])
    }

    defineEdge(triangle, 0, 1)
    defineEdge(triangle, 1, 2)
    defineEdge(triangle, 2, 0)

    triangle.intersections.forEach((xArray) => {
        if(xArray[0].x > xArray[1].x) {
            let temp = xArray[0]
            xArray[0] = xArray[1]
            xArray[1] = temp
        }
        xArray[0].x = Math.ceil(xArray[0].x)
        xArray[1].x = Math.floor(xArray[1].x);
    })
}

function defineEdge (triangle, v0, v1) {
    const variation = (triangle.vertex[v1].x - triangle.vertex[v0].x) / (triangle.vertex[v1].y - triangle.vertex[v0].y)
    const variationR = (triangle.vertex[v1].color.r - triangle.vertex[v0].color.r) / (triangle.vertex[v1].y - triangle.vertex[v0].y)
    const variationG = (triangle.vertex[v1].color.g - triangle.vertex[v0].color.g) / (triangle.vertex[v1].y - triangle.vertex[v0].y)
    const variationB = (triangle.vertex[v1].color.b - triangle.vertex[v0].color.b) / (triangle.vertex[v1].y - triangle.vertex[v0].y)

    let initialY, endY, currentX, currentR, currentG, currentB

    if (triangle.vertex[v0].y < triangle.vertex[v1].y) {
        initialY = triangle.vertex[v0].y;
        endY = triangle.vertex[v1].y;
        currentX = triangle.vertex[v0].x;

        currentR = triangle.vertex[v0].color.r
        currentG = triangle.vertex[v0].color.g
        currentB = triangle.vertex[v0].color.b
      } else {
        initialY = triangle.vertex[v1].y;
        endY = triangle.vertex[v0].y;
        currentX = triangle.vertex[v1].x;

        currentR = triangle.vertex[v1].color.r
        currentG = triangle.vertex[v1].color.g
        currentB = triangle.vertex[v1].color.b
      }
  
      for (let currentY = initialY; currentY < endY; currentY++) {
        triangle.intersections.get(currentY).push({x: currentX, r: currentR, g: currentG, b: currentB});
        currentX += variation;
        currentR += variationR;
        currentG += variationG;
        currentB += variationB;
      }
}

function fillPoly(triangle) {
    const initialY = triangle.minY
    const endY = triangle.maxY
    const intersections = triangle.intersections
    
    for (let currentY = initialY; currentY < endY; currentY++) {
      const currentEdge = intersections.get(currentY);

      let k = 0;
      do {
        let firstX = currentEdge[k].x;
        let endX = currentEdge[k + 1].x;

        let currentR = currentEdge[k].r
        let currentG = currentEdge[k].g
        let currentB = currentEdge[k].b

        const variationR = (currentEdge[k + 1].r - currentEdge[k].r) / (endX - firstX)
        const variationG = (currentEdge[k + 1].g - currentEdge[k].g) / (endX - firstX)
        const variationB = (currentEdge[k + 1].b - currentEdge[k].b) / (endX - firstX)


        for (let currentX = firstX; currentX < endX; currentX++){
          drawSquare(currentX, currentY, {r:currentR, g:currentG, b:currentB, a: 1}, 1, 1);
          console.log(currentX, currentY)
          currentR += variationR
          currentG += variationG
          currentB += variationB
        }
        k += 2;
      } while (currentEdge[k]);
    }
  }


function drawTriangle() {
    triangles.forEach(t => {
        drawCircle(t.vertex[0].x, t.vertex[0].y, {r: t.vertex[0].color.r, g:t.vertex[0].color.g, b:t.vertex[0].color.b})
        drawCircle(t.vertex[1].x, t.vertex[1].y, {r: t.vertex[1].color.r, g:t.vertex[1].color.g, b:t.vertex[1].color.b})
        drawCircle(t.vertex[2].x, t.vertex[2].y, {r: t.vertex[2].color.r, g:t.vertex[2].color.g, b:t.vertex[2].color.b})

        defineIntersections(t)
        fillPoly(t)
        ctx.strokeStyle = `rgb(${t.edgeColor.r}, ${t.edgeColor.g}, ${t.edgeColor.b})`
        ctx.beginPath()
        ctx.moveTo(t.vertex[0].x, t.vertex[0].y) 
        ctx.lineTo(t.vertex[1].x, t.vertex[1].y)
        ctx.lineTo(t.vertex[2].x, t.vertex[2].y)
        ctx.lineTo(t.vertex[0].x, t.vertex[0].y)
        ctx.closePath()
        ctx.stroke()
    })
}

function removeTriangle(id) {
    let k = 0
    triangles.forEach((t, i) => {
        if(t.id == id) k = i
    })
    triangles.splice(k, 1)
}

function colorChanged (e) {
    const triangleId = e.target.id
    const typeColor = e.target.className === 'e' ? 'e' : Number(e.target.className)
    const newColor = hexToRgb(e.target.value)


    triangles.forEach(t => {
        if(t.id == triangleId) {
            if(e.target.className === 'e'){
                t.edgeColor.r = newColor.r
                t.edgeColor.g = newColor.g
                t.edgeColor.b = newColor.b
            } else {
                t.vertex[typeColor].color.r = newColor.r
                t.vertex[typeColor].color.g = newColor.g
                t.vertex[typeColor].color.b = newColor.b
            }
        }
    })
    drawTriangle()
}

function addToList (triangle) {
    const newTriangleLI = document.createElement("li")
    const newDeleteButton = document.createElement("button")

    const v0Color = document.createElement("input")
    v0Color.type = 'color'
    v0Color.value = rgbToHex(triangle.vertex[0].color.r, triangle.vertex[0].color.g, triangle.vertex[0].color.b)
    v0Color.addEventListener('change', colorChanged)
    v0Color.id = id
    v0Color.className = '0'

    const v1Color = document.createElement("input")
    v1Color.type = 'color'
    v1Color.value = rgbToHex(triangle.vertex[1].color.r, triangle.vertex[1].color.g, triangle.vertex[1].color.b)
    v1Color.addEventListener('change', colorChanged)
    v1Color.id = id
    v1Color.className = '1'

    const v2Color = document.createElement("input")
    v2Color.type = 'color'
    v2Color.value = rgbToHex(triangle.vertex[2].color.r, triangle.vertex[2].color.g, triangle.vertex[2].color.b)
    v2Color.addEventListener('change', colorChanged)
    v2Color.id = id
    v2Color.className = '2'

    const edgeColor = document.createElement("input")
    edgeColor.type = 'color'
    edgeColor.value = rgbToHex(triangle.edgeColor.r, triangle.edgeColor.g, triangle.edgeColor.b)
    edgeColor.addEventListener('change', colorChanged)
    edgeColor.id = id
    edgeColor.className = 'e'

    newDeleteButton.addEventListener("click", (e) => {
        const closestLi = e.target.closest('li')
        removeTriangle(closestLi.id)
        triangleList.removeChild(closestLi)

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawTriangle()
    })
    newDeleteButton.innerText = "Delete"
    newTriangleLI.setAttribute("id", id)
    newTriangleLI.innerHTML = `Triangle ${id}`    
    newTriangleLI.appendChild(v0Color)
    newTriangleLI.appendChild(v1Color)
    newTriangleLI.appendChild(v2Color)
    newTriangleLI.appendChild(edgeColor)
    newTriangleLI.appendChild(newDeleteButton)
    triangleList.appendChild(newTriangleLI)
}

function drawSquare(x, y, {r, g, b, a}, tx, ty) {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
    ctx.fillRect(x, y, 1, 1)
}

function drawCircle (x, y, {r, g, b}) {
    ctx.beginPath()
    ctx.arc(x, y, 5, 0, 2 * Math.PI)
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`
    ctx.fill()
    ctx.closePath()
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    let r = Math.round(Math.random() * (255 - 0) + 0)
    let g = Math.round(Math.random() * (255 - 0) + 0)
    let b = Math.round(Math.random() * (255 - 0) + 0)
    drawCircle(x, y, {r, g, b })

    const color = {r, g, b, a:1}
    const coordinate = {x, y, color}
    if(clickNumbers == 0) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        if(y > triangle.maxY) triangle.maxY = y
        if(y < triangle.minY) triangle.minY = y
        return
    }
    if(clickNumbers == 1) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        if(y > triangle.maxY) triangle.maxY = y
        if(y < triangle.minY) triangle.minY = y
        return
    }
    if(clickNumbers == 2) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        clickNumbers=0
        if(y > triangle.maxY) triangle.maxY = y
        if(y < triangle.minY) triangle.minY = y

        let er = Math.round(Math.random() * (255 - 0) + 0)
        let eg = Math.round(Math.random() * (255 - 0) + 0)
        let eb = Math.round(Math.random() * (255 - 0) + 0)
        triangle.edgeColor = {r: er, g: eg, b: eb}
        triangles.push(triangle)

        addToList(triangle)
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawTriangle()
        id++
        triangle = {id, vertex: [], edgeColor:{}, intersections: new Map(), minY: 999, maxY: 0}
        return
    }
})
