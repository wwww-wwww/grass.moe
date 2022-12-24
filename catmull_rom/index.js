function get_resolution() {
  try {
    const s = input_resolution.value.split("x")
    return [parseInt(s[0]), parseInt(s[1])]
  } catch (_e) {
    return null
  }
}

function resize_canvas() {
  const resolution = get_resolution()
  if (!resolution) { return }

  const r = resolution[0] / resolution[1]
  const bb = container.parentElement.getBoundingClientRect()

  if (r > 1 && bb.width / r > bb.height
    || r < 1 && bb.height * r < bb.width
    || r == 1 && bb.height * r < bb.width) {
    container.style.width = bb.height * r + "px"
    container.style.height = bb.height + "px"
  } else {
    container.style.width = bb.width + "px"
    container.style.height = bb.width / r + "px"
  }

  write_tree()
}

resize_canvas()
new ResizeObserver(resize_canvas).observe(container.parentElement)
input_resolution.addEventListener("input", resize_canvas)

function create_e(root, tag, class_name) {
  const e = document.createElement(tag)
  if (root) { root.appendChild(e) }
  e.className = class_name
  return e
}

function solve(data, alpha = 0.5) {
  data = data.reduce((a, b) => a.concat(b), [])
  const last = data.length - 4

  let path = "M" + [data[0], data[1]]

  for (let i = 0; i < data.length - 2; i += 2) {
    const x0 = i ? data[i - 2] : data[0]
    const y0 = i ? data[i - 1] : data[1]

    const x1 = data[i + 0]
    const y1 = data[i + 1]

    const x2 = data[i + 2]
    const y2 = data[i + 3]

    const x3 = i !== last ? data[i + 4] : x2
    const y3 = i !== last ? data[i + 5] : y2

    const d1 = ((x0 - x1) ** 2 + (y0 - y1) ** 2) ** 0.5
    const d2 = ((x1 - x2) ** 2 + (y1 - y2) ** 2) ** 0.5
    const d3 = ((x2 - x3) ** 2 + (y2 - y3) ** 2) ** 0.5

    const d3powA = d3 ** alpha
    const d3pow2A = d3 ** (2 * alpha)
    const d2powA = d2 ** alpha
    const d2pow2A = d2 ** (2 * alpha)
    const d1powA = d1 ** alpha
    const d1pow2A = d1 ** (2 * alpha)

    const A = 2 * d1pow2A + 3 * d1powA * d2powA + d2pow2A
    const B = 2 * d3pow2A + 3 * d3powA * d2powA + d2pow2A

    let N = 3 * d1powA * (d1powA + d2powA)
    if (N > 0) {
      N = 1 / N
    }

    let M = 3 * d3powA * (d2powA + d3powA)
    if (M > 0) {
      M = 1 / M
    }

    let cp1x = (-d2pow2A * x0 + A * x1 + d1pow2A * x2) * N
    let cp1y = (-d2pow2A * y0 + A * y1 + d1pow2A * y2) * N

    let cp2x = (d3pow2A * x1 + B * x2 - d2pow2A * x3) * M
    let cp2y = (d3pow2A * y1 + B * y2 - d2pow2A * y3) * M

    if (!cp1x && !cp1y) {
      cp1x = x1
      cp1y = y1
    }

    if (!cp2x && !cp2y) {
      cp2x = x2
      cp2y = y2
    }

    path += "C" + [cp1x, cp1y, cp2x, cp2y, x2, y2]
  }

  return path
}

function write_tree() {
  const points = get_points()
  path.setAttribute("d", solve(points, 0.5))

  const resolution = get_resolution()
  const sx = resolution[0] / 100
  const sy = resolution[1] / 100

  textarea_tree.value = points
    .map(p => `${Math.round(p[0] * sx)} ${Math.round(p[1] * sy)}`)
    .join("\n")
}

function get_points() {
  return [...container.children]
    .filter(e => e.className == "node")
    .map(e => [
      parseFloat(e.style.left),
      parseFloat(e.style.top)
    ])
}

textarea_tree.addEventListener("input", () => {
  while (container.lastChild && container.lastChild.className == "node") {
    container.removeChild(container.lastChild)
  }

  const resolution = get_resolution()
  const sx = resolution[0] / 100
  const sy = resolution[1] / 100

  const points = textarea_tree.value
    .split("\n")
    .map(s => s.split(" "))
    .filter(s => s.length == 2)
    .map(s => [parseFloat(s[0]) / sx, parseFloat(s[1]) / sy])

  points.forEach(p => {
    const node = create_e(container, "node", "node")
    node.style.left = p[0] + "%"
    node.style.top = p[1] + "%"
  })

  path.setAttribute("d", solve(points, 0.5))
})

document.addEventListener("keydown", e => {
  if (e.key == "Control") {
    container.classList.toggle("control", true)
  }
})

document.addEventListener("keyup", e => {
  if (e.key == "Control") {
    container.classList.toggle("control", false)
  }
})

container.addEventListener("mousedown", e => {
  if (e.target.className == "node") {
    if (e.ctrlKey) {
      container.removeChild(e.target)
      write_tree()
      return
    }

    const mm = e2 => {
      const bb = container.getBoundingClientRect()
      const pos = [
        (e2.clientX - bb.left) / bb.width,
        (e2.clientY - bb.top) / bb.height
      ]
      e.target.style.left = pos[0] * 100 + "%"
      e.target.style.top = pos[1] * 100 + "%"

      write_tree()
    }

    const mu = e2 => {
      document.removeEventListener("mousemove", mm)
      document.removeEventListener("mouseup", mu)
      mm(e2)
    }

    document.addEventListener("mousemove", mm)
    document.addEventListener("mouseup", mu)
  }

  if (e.target != container) { return }

  const bb = container.getBoundingClientRect()
  const pos = [
    (e.clientX - bb.left) / bb.width,
    (e.clientY - bb.top) / bb.height
  ]
  const node = create_e(container, "node", "node")
  node.style.left = pos[0] * 100 + "%"
  node.style.top = pos[1] * 100 + "%"

  write_tree()
})
