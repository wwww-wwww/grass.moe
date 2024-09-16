import OpenSeadragon from "./openseadragon"

const OS = OpenSeadragon({
  id: "openseadragon1",
  prefixUrl: "/openseadragon/images/",
  minZoomLevel: 0,
  animationTime: 0.5,
  springStiffness: 20,
  constrainDuringPan: false,
  visibilityRatio: 1,
})

Array.from(document.getElementsByClassName("image")).forEach(e => {
  e.addEventListener("click", () => {
    viewer.classList.toggle("visible", true)
    OS.open(e.dataset.dzi)
  })
})

viewer.addEventListener("click", e => {
  if (e.target != viewer) return

  viewer.classList.toggle("visible", false)
})