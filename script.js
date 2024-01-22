const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")

let clickNumbers = 0
let triangles = []
let triangle = {vertex: [], color: [], intersections: new Map(), minY: 999, maxY: 0}

const triangleList = document.querySelector(".triangleList")

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
        xArray.sort((a, b) => a - b);
        const arraySize = xArray.length;
        for (let i = 0; i < arraySize; i++) {
          if (i % 2 === 0) xArray[i] = Math.ceil(xArray[i]);
          else xArray[i] = Math.floor(xArray[i]);
        }
    })
}

function defineEdge (triangle, v0, v1) {
    const variation = (triangle.vertex[v1].x - triangle.vertex[v0].x) / (triangle.vertex[v1].y - triangle.vertex[v0].y)
    let initialY, endY, currentX
    if (triangle.vertex[v0].y < triangle.vertex[v1].y) {
        initialY = triangle.vertex[v0].y;
        endY = triangle.vertex[v1].y;
        currentX = triangle.vertex[v0].x;
      } else {
        initialY = triangle.vertex[v1].y;
        endY = triangle.vertex[v0].y;
        currentX = triangle.vertex[v1].x;
      }
  
      for (let currentY = initialY; currentY < endY; currentY++) {
        triangle.intersections.get(currentY).push(currentX);
        currentX += variation;
      }

}

function compareVertex (a, b) {
    if(a.y > b.y) {
        return 1
    }
    if(a.y < b.y) {
        return -1
    }
    if(a.y === b.y) {
        return 0
    }
}


function fillPoly(triangle) {
    const initialY = triangle.minY
    const endY = triangle.maxY
    const intersections = triangle.intersections
  
    for (let currentY = initialY; currentY < endY; currentY++) {
      const currentPoint = intersections.get(currentY);
      let k = 0;
  
      do {
        let firstX = currentPoint[k];
        let endX = currentPoint[k + 1];
  
        for (let currentX = firstX; currentX < endX; currentX++)
          drawSquare(currentX, currentY, {r:255, g:0, b:255, a: 1}, 1, 1);
  
        k += 2;
      } while (currentPoint[k]);
    }
  }


function drawTriangle() {
    triangles.forEach(t => {
        defineIntersections(t)
        fillPoly(t)
        ctx.beginPath()
        ctx.moveTo(t.vertex[0].x, t.vertex[0].y) 
        ctx.lineTo(t.vertex[1].x, t.vertex[1].y)
        ctx.lineTo(t.vertex[2].x, t.vertex[2].y)
        ctx.lineTo(t.vertex[0].x, t.vertex[0].y)
        ctx.closePath()
        ctx.stroke()
    })
}

function drawSquare(x, y, {r, g, b, a}, tx, ty) {
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${a})`
    ctx.fillRect(x, y, tx, ty)
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    drawSquare(x, y, {r: 255, g: 0, b: 0, a: 1}, 4, 4)

    const coordinate = {x, y}
    if(clickNumbers == 0) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        triangle.color.push({r: 255, g: 0, b: 0})
        if(y > triangle.maxY) triangle.maxY = y
        if(y < triangle.minY) triangle.minY = y
        return
    }
    if(clickNumbers == 1) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        triangle.color.push({r: 0, g: 255, b: 0})
        if(y > triangle.maxY) triangle.maxY = y
        if(y < triangle.minY) triangle.minY = y
        return
    }
    if(clickNumbers == 2) {
        clickNumbers ++
        triangle.vertex.push(coordinate)
        triangle.color.push({r: 0, g: 0, b: 255})
        clickNumbers=0
        if(y > triangle.maxY) triangle.maxY = y
        if(y < triangle.minY) triangle.minY = y
        triangles.push(triangle)
        const newTriangleLI = document.createElement("li")
        const newDeleteButton = document.createElement("button")
        newDeleteButton.addEventListener("click", (e) => {
            const removeblePosition = e.target.id
            const buttonSelected = document.querySelector("button#"+removeblePosition)
            console.log(removebleParent)
            triangles.splice(removeblePosition - 1, 1)
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            triangleList.removeChild(buttonSelected.parentNode)
            drawTriangle()
        })
        newDeleteButton.innerText = "Delete"
        newDeleteButton.setAttribute("id", triangles.length)
        newTriangleLI.innerHTML = `Triangle ${triangles.length}`    
        newTriangleLI.appendChild(newDeleteButton)
        newTriangleLI
        triangleList.appendChild(newTriangleLI)
        drawTriangle()
        triangle = {vertex: [], color: [], intersections: new Map(), minY: 999, maxY: 0}
        return
    }
})
