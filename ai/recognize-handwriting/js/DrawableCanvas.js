function DrawableCanvas (el) {
  const px = 5
  const ctx = el.getContext('2d')
  let x = []
  let y = []
  let moves = []
  let isPainting = false

  const clear = () => ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

  const addPoint = (_x, _y, isMoving) => {
    x.push(_x)
    y.push(_y)
    moves.push(isMoving)
  }

  const redraw = () => {
    clear()

    ctx.strokeStyle = '#dc3545'
    ctx.lineJoin = 'round'
    ctx.lineWidth = px

    for (let i = 0; i < moves.length; i++) {
      ctx.beginPath()
      if (moves[i] && i) {
        ctx.moveTo(x[i - 1], y[i - 1])
      } else {
        ctx.moveTo(x[i] - 1, y[i])
      }
      ctx.lineTo(x[i], y[i])
      ctx.closePath()
      ctx.stroke()
    }
  }

  const drawLine = (x1, y1, x2, y2, color = 'lightgray') => {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineJoin = 'miter'
    ctx.lineWidth = 1
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
  }

  const grid = () => {
    const w = el.clientWidth
    const h = el.clientHeight
    const p = el.clientWidth / px
    const xStep = w / p
    const yStep = h / p

    for (let x = 0; x < w; x += xStep) {
      drawLine(x, 0, x, h)
    }
    for (let y = 0; y < h; y += yStep) {
      drawLine(0, y, w, y)
    }
  }

  const cell = (x, y, w, h) => {
    ctx.fillStyle = 'blue'
    ctx.strokeStyle = 'blue'
    ctx.lineJoin = 'miter'
    ctx.lineWidth = 1
    ctx.rect(x, y, w, h)
    ctx.fill()
  }

  this.reset = () => {
    isPainting = false
    x = []
    y = []
    moves = []
    clear()
  }

  this.getVector = (debug = false) => {
    const w = el.clientWidth
    const h = el.clientHeight
    const p = el.clientWidth / px
    const xStep = w / p
    const yStep = h / p
    const vector = []

    for (let x = 0; x < w; x += xStep) {
      for (let y = 0; y < h; y += yStep) {
        const data = ctx.getImageData(x, y, xStep, yStep)

        let nonEmptyPixelsCount = 0
        for (let i = 0; i < data.data.length; i += 4) {
          const isEmpty = data.data[i] === 0
          if (!isEmpty) {
            nonEmptyPixelsCount += 1
          }
        }

        if (nonEmptyPixelsCount > 1 && debug) {
          cell(x, y, xStep, yStep)
        }

        vector.push(nonEmptyPixelsCount > 1 ? 1 : 0)
      }
    }

    if (debug) {
      grid()
    }

    return vector
  }

  el.addEventListener('mousedown', e => {
    const bounds = e.target.getBoundingClientRect()
    const x = e.clientX - bounds.left
    const y = e.clientY - bounds.top
    isPainting = true
    addPoint(x, y, false)
    redraw()
  })

  el.addEventListener('mousemove', e => {
    const bounds = e.target.getBoundingClientRect()
    const x = e.clientX - bounds.left
    const y = e.clientY - bounds.top
    if (isPainting) {
      addPoint(x, y, true)
      redraw()
    }
  })

  el.addEventListener('mouseup', () => {
    isPainting = false
  })

  el.addEventListener('mouseleave', () => {
    isPainting = false
  })

  /* el.addEventListener('touchstart', function (e) {
    e.preventDefault()
    e.stopPropagation()
  }) */
  /* el.addEventListener('touchmove', function (e) {
    e.preventDefault()
    e.stopPropagation()
    var touch = e.touches[0]
    var mouseEvent = new window.MouseEvent('mousemove', {
      clientX: touch.clientX,
      clientY: touch.clientY
    })
    el.dispatchEvent(mouseEvent)
  }, false) */
  /* el.addEventListener("touchend",    function(event) {event.preventDefault()})
  el.addEventListener("touchcancel", function(event) {event.preventDefault()}) */
}
