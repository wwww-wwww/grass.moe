
const objects = []

const mouse = { x: -1, y: -1 }

function spawn() {
  objects.push({
    x: Math.random() * back.width,
    y: Math.random() * back.height,
    h: Math.random(),
    wiggle_t: 0,
    wiggle_r: 0,
    wiggle: 0,
    tx: Math.random() * back.width,
    ty: Math.random() * back.height,
  })
}

document.addEventListener("click", e => {
  for (let i = 0; i < 100; i++) {
    spawn()
  }
  mouse.x = e.clientX
  mouse.y = e.clientY
})

document.addEventListener("mousemove", e => {
  spawn()
  mouse.x = e.clientX
  mouse.y = e.clientY
})

setInterval(spawn, 250)

window.addEventListener("resize", e => {
  const bb = back.getBoundingClientRect()
  back.width = bb.width
  back.height = bb.height
})

window.dispatchEvent(new Event("resize"))

const c = document.getElementById("back")
const ctx = c.getContext("2d")

function dist(x1, y1, x2, y2) {
  return (x2 - x1) ** 2 + (y2 - y1) ** 2
}

function normalize(x, y) {
  const d = Math.sqrt(x ** 2 + y ** 2)
  return { x: x / d, y: y / d }
}

let last_time = performance.now()
function draw() {
  let time = performance.now()
  let dt = time - last_time
  last_time = time

  ctx.fillStyle = "rgba(255, 255, 255, 0.13)"
  ctx.fillRect(0, 0, back.width, back.height)
  ctx.lineWidth = 4

  for (let i = 0; i < objects.length; i++) {
    const o = objects[i]

    ctx.strokeStyle = `hsla(${o.h * 360}, 100%, 35%, 0.25)`
    let tx = mouse.x == -1 ? o.tx : mouse.x
    let ty = mouse.y == -1 ? o.ty : mouse.y

    let d = normalize(tx - o.x, ty - o.y)

    if (time - o.wiggle_t > 0) {
      o.wiggle_t = time + 20 + Math.random() * 40
      o.wiggle_r = Math.random() * 1 - 0.5
    }

    o.wiggle += (o.wiggle_r - o.wiggle) * dt / 40
    const a = Math.atan2(d.y, d.x) + o.wiggle
    d = { x: Math.cos(a), y: Math.sin(a) }

    if (dist(o.x, o.y, tx, ty) < 100) {
      objects.splice(i, 1)
      i--
      continue
    }

    ctx.beginPath()
    ctx.moveTo(o.x, o.y)
    o.x += (d.x) * dt
    o.y += (d.y) * dt
    ctx.lineTo(o.x, o.y)
    ctx.stroke()
  }

  window.requestAnimationFrame(draw)
}

window.requestAnimationFrame(draw)
