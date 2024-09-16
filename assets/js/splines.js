const canvas = document.getElementById("canvas")
const txt_area = document.getElementById("txt_area")

const line1 = [
  [50, 20],
  [50, 30],
  [50, 40],
  [70, 50],
  [50, 60],
  [50, 70],
  [50, 80],
]

const line2 = [
  [50, 20],
  [50, 30],
  [50, 40],
  [50, 60],
  [50, 70],
  [50, 80],
]

function dist(ix, iy, jx, jy) {
  return ((ix - jx) ** 2 + (iy - jy) ** 2) ** 0.5
}

function catmull_rom(points, start, t, alpha = 0.5) {
  const last = points.length - 2

  const p0 = start ? points[start - 1] : points[0]
  const p1 = points[start]
  const p2 = points[start + 1]
  const p3 = start < last ? points[start + 2] : p2

  const a1 = -p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]
  const a2 = -p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]
  const b1 = 2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]
  const b2 = 2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]
  const c1 = -p0[0] + p2[0]
  const c2 = -p0[1] + p2[1]
  const d1 = 2 * p1[0]
  const d2 = 2 * p1[1]

  const x = (a1 * (t ** 3) + b1 * (t ** 2) + c1 * t + d1) * alpha
  const y = (a2 * (t ** 3) + b2 * (t ** 2) + c2 * t + d2) * alpha

  return [x, y]
}

function shoelace(p0, p1, p2, p3) {
  return Math.abs(((p0[0] * p1[1] - p0[1] * p1[0]) + (p1[0] * p2[1] - p1[1] * p2[0]) +
    (p2[0] * p3[1] - p2[1] * p3[0]) + (p3[0] * p0[1] - p3[1] * p0[0])) / 2)
}

const ctx = canvas.getContext("2d")

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  let res = 10

  // draw paths
  {
    let last_x = -1
    let last_y = -1

    for (let i = 0; i < line1.length - 1; i++) {
      ctx.fillStyle = "rgb(100, 220, 100)"
      ctx.beginPath()
      ctx.text
      ctx.arc(line1[i][0] * 10, line1[i][1] * 10, 10, 0, 2 * Math.PI)
      ctx.fill()

      for (let j = 0; j < res; j++) {
        let [x, y] = catmull_rom(line1, i, j / res)

        if (last_x !== -1 && last_y !== -1) {
          ctx.strokeStyle = "blue"
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.moveTo(last_x * 10, last_y * 10)
          ctx.lineTo(x * 10, y * 10)
          ctx.stroke()
        }

        last_x = x
        last_y = y
      }
    }

    last_x = -1
    last_y = -1
    for (let i = 0; i < line2.length - 1; i++) {
      ctx.fillStyle = "rgb(100, 220, 100)"
      ctx.beginPath()
      ctx.text
      ctx.arc(line2[i][0] * 10, line2[i][1] * 10, 10, 0, 2 * Math.PI)
      ctx.fill()

      for (let j = 0; j < res; j++) {
        let [x, y] = catmull_rom(line2, i, j / res)

        if (last_x !== -1 && last_y !== -1) {
          ctx.strokeStyle = "blue"
          ctx.lineWidth = 4
          ctx.beginPath()
          ctx.moveTo(last_x * 10, last_y * 10)
          ctx.lineTo(x * 10, y * 10)
          ctx.stroke()
        }

        last_x = x
        last_y = y
      }
    }
  }

  let idx_start = 1

  let line1_spls = []
  let line2_spls = []

  for (let idx = 0; idx < 4; idx++) {
    line1_spls.push(line1[idx_start + idx])
    for (let i = 1; i < res; i++) {
      const [x, y] = catmull_rom(line1, (idx_start + idx), i / res)
      line1_spls.push([x, y])
    }
  }
  line1_spls.push(line1[idx_start + 4])

  for (let idx = 0; idx < 3; idx++) {
    line2_spls.push(line2[idx_start + idx])
    let in_res = res
    if (idx == 1) {
      in_res *= 2
    }
    for (let i = 1; i < in_res; i++) {
      const [x, y] = catmull_rom(line2, (idx_start + idx), i / in_res)
      line2_spls.push([x, y])
    }
  }
  line2_spls.push(line2[idx_start + 3])

  let last_x = -1
  let last_y = -1
  let last_x2 = -1
  let last_y2 = -1

  let total_area = 0

  for (let i = 0; i < line1_spls.length; i++) {
    let [x, y] = line1_spls[i]
    ctx.fillStyle = "blue"
    ctx.beginPath()
    ctx.arc(x * 10, y * 10, 5, 0, 2 * Math.PI)
    ctx.fill()

    let [x2, y2] = line2_spls[i]
    ctx.fillStyle = "red"
    ctx.beginPath()
    ctx.arc(x2 * 10, y2 * 10, 5, 0, 2 * Math.PI)
    ctx.fill()

    if (last_x != -1) {
      ctx.fillStyle = "orange"
      ctx.beginPath()
      ctx.moveTo(last_x * 10, last_y * 10)
      ctx.lineTo(x * 10, y * 10)
      ctx.lineTo(x2 * 10, y2 * 10)
      ctx.lineTo(last_x2 * 10, last_y2 * 10)
      ctx.fill()
      total_area += shoelace([last_x, last_y], [last_x2, last_y2], [x2, y2], [x, y])
    }

    last_x = x
    last_y = y
    last_x2 = x2
    last_y2 = y2
  }

  txt_area.textContent = Math.round(total_area * 100) / 100
}

render()

function mousemove(e) {
  const bb = canvas.getBoundingClientRect()
  const scale = 100 / bb.width
  const x = e.clientX - bb.left
  const y = e.clientY - bb.top
  line1[3] = [x * scale, y * scale]
  render()
}

function touchmove(e) {
  mousemove(e.touches[0])
}

canvas.addEventListener("touchstart", e => {
  e.preventDefault()
  touchmove(e)

  window.addEventListener("touchmove", touchmove)
  window.addEventListener("touchend", () => {
    window.removeEventListener("touchmove", touchmove)
  })
})


canvas.addEventListener("mousedown", e => {
  e.preventDefault()
  mousemove(e)

  window.addEventListener("mousemove", mousemove)
  window.addEventListener("mouseup", () => {
    window.removeEventListener("mousemove", mousemove)
  })
})
