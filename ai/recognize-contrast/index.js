const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b
  })
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: (parseInt(result[1], 16) / 2.55) / 100,
    g: (parseInt(result[2], 16) / 2.55) / 100,
    b: (parseInt(result[3], 16) / 2.55) / 100
  } : null
}

const randomHex = () => {
  return '#000000'.replace(/0/g, () => {
    return (~~(Math.random() * 16)).toString(16)
  })
}

const network = new window.brain.NeuralNetwork()

let dataPointLength = 0
const dataPoints = [
  { color: randomHex() }
]

const square1Selector = document.getElementById('square1')
const square2Selector = document.getElementById('square2')

const square3Selector = document.getElementById('square3')
const square4Selector = document.getElementById('square4')
const square5Selector = document.getElementById('square5')
const square6Selector = document.getElementById('square6')
const square7Selector = document.getElementById('square7')
const square8Selector = document.getElementById('square8')
const square9Selector = document.getElementById('square9')
const square10Selector = document.getElementById('square10')

const countDataPointsSelector = document.getElementById('countDataPoints')
const resultWithXDataPointsSelector = document.getElementById('resultWithXDataPoints')
const trainNeuralNetworkSelector = document.getElementById('trainNeuralNetwork')
const randomizeColorsSelector = document.getElementById('randomizeColors')

square1Selector.style.backgroundColor = dataPoints[dataPointLength].color
square2Selector.style.backgroundColor = dataPoints[dataPointLength].color

const selectDataPoint = (opts) => {
  dataPoints[dataPointLength][opts.dark ? 'dark' : 'light'] = true

  dataPoints.push({ color: randomHex() })

  dataPointLength++
  countDataPointsSelector.innerHTML = dataPointLength
  square1Selector.style.backgroundColor = dataPoints[dataPointLength].color
  square2Selector.style.backgroundColor = dataPoints[dataPointLength].color

  if (dataPointLength) {
    trainNeuralNetworkSelector.removeAttribute('disabled')
  }
}

square1Selector.addEventListener('click', () => {
  selectDataPoint({ light: true })
})
square2Selector.addEventListener('click', () => {
  selectDataPoint({ dark: true })
})

const resultColorCodes = {
  square3: randomHex(),
  square4: randomHex(),
  square5: randomHex(),
  square6: randomHex(),
  square7: randomHex(),
  square8: randomHex(),
  square9: randomHex(),
  square10: randomHex()
}

square3Selector.style.backgroundColor = resultColorCodes.square3
square4Selector.style.backgroundColor = resultColorCodes.square4
square5Selector.style.backgroundColor = resultColorCodes.square5
square6Selector.style.backgroundColor = resultColorCodes.square6
square7Selector.style.backgroundColor = resultColorCodes.square7
square8Selector.style.backgroundColor = resultColorCodes.square8
square9Selector.style.backgroundColor = resultColorCodes.square9
square10Selector.style.backgroundColor = resultColorCodes.square10

const resultColor = (opts) => {
  if (opts.changeColors) {
    resultColorCodes['square' + opts.square] = randomHex()
  }

  const squareRandomColor = resultColorCodes['square' + opts.square]
  const squareColorRgb = hexToRgb(squareRandomColor)
  const squareLikely = window.brain.likely(squareColorRgb, network)
  const squareRunNetwork = network.run(squareColorRgb)

  const darkness = (squareRunNetwork.dark * 100).toFixed(2)
  const lightness = (squareRunNetwork.light * 100).toFixed(2)
  opts.selector.getElementsByClassName('dark')[0].innerHTML = 'DARK: ' + darkness + '%'
  opts.selector.getElementsByClassName('light')[0].innerHTML = 'LIGHT: ' + lightness + '%'

  opts.selector.classList.remove('light')
  opts.selector.classList.remove('dark')
  opts.selector.classList.add(squareLikely)
  opts.selector.style.backgroundColor = squareRandomColor
}
const resultColors = (opts) => {
  resultColor({ square: '3', selector: square3Selector, changeColors: opts.changeColors })
  resultColor({ square: '4', selector: square4Selector, changeColors: opts.changeColors })
  resultColor({ square: '5', selector: square5Selector, changeColors: opts.changeColors })
  resultColor({ square: '6', selector: square6Selector, changeColors: opts.changeColors })
  resultColor({ square: '7', selector: square7Selector, changeColors: opts.changeColors })
  resultColor({ square: '8', selector: square8Selector, changeColors: opts.changeColors })
  resultColor({ square: '9', selector: square9Selector, changeColors: opts.changeColors })
  resultColor({ square: '10', selector: square10Selector, changeColors: opts.changeColors })
}

randomizeColorsSelector.addEventListener('click', () => {
  resultColors({ changeColors: true })
})

trainNeuralNetworkSelector.addEventListener('click', () => {
  const trainingData = []
  dataPoints.map((dataPoint) => {
    if (dataPoint.hasOwnProperty('dark') || dataPoint.hasOwnProperty('light')) {
      const _hexToRgb = hexToRgb(dataPoint.color)

      if (_hexToRgb) {
        const newTraininDataPoint = { input: _hexToRgb, output: {} }

        if (dataPoint.hasOwnProperty('dark')) {
          newTraininDataPoint.output.dark = 1
          newTraininDataPoint.output.light = 0
        } else if (dataPoint.hasOwnProperty('light')) {
          newTraininDataPoint.output.dark = 0
          newTraininDataPoint.output.light = 1
        }

        trainingData.push(newTraininDataPoint)
      }
    }
  })

  network.train(trainingData)

  resultWithXDataPointsSelector.innerHTML = dataPointLength

  randomizeColorsSelector.removeAttribute('disabled')

  resultColors({ changeColors: false })
})
