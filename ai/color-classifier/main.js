let model
let trained = false

let colorOnScreen = ''
let collectedColors = []
const labelList = [
  'red-ish',
  'pink-ish',
  'orange-ish',
  'yellow-ish',
  'purple-ish',
  'green-ish',
  'blue-ish',
  'brown-ish',
  'gray-ish',
  'black-ish'
]

const rgbToHex = (props) => {
  return '#' + ((1 << 24) + (props.r << 16) + (props.g << 8) + props.b).toString(16).slice(1)
}
const hexToRgb = (hex) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  hex = hex.replace(shorthandRegex, (m, r, g, b) => {
    return r + r + g + g + b + b
  })
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null
}

const randomRgbGenerator = () => {
  const round = Math.round
  const random = Math.random
  const number = 255

  const r = round(random() * number)
  const g = round(random() * number)
  const b = round(random() * number)

  return {
    r: r,
    g: g,
    b: b
  }
}

const showRandomColor = () => {
  const newColor = randomRgbGenerator()
  const showColorSelector = document.getElementById('showColor')
  showColorSelector.style.backgroundColor = rgbToHex(newColor)
  colorOnScreen = newColor
}

const classifyColors = () => {
  const classifyButtonSelector = document.getElementsByClassName('classifyButton')
  const classifyButton = function () {
    const getColor = this.getAttribute('data-color')

    if (getColor) {
      const colorDetails = {
        r: colorOnScreen.r,
        g: colorOnScreen.g,
        b: colorOnScreen.b,
        label: getColor
      }
      collectedColors.push(colorDetails)

      const selectedColorsSelector = document.getElementById('selectedColors').getElementsByTagName('tbody')[0]
      if (collectedColors.length < 2) selectedColorsSelector.innerHTML = ''
      const newRow = selectedColorsSelector.insertRow(0)

      const colorCell = document.createElement('div')
      const cssRgb = colorOnScreen.r + ', ' + colorOnScreen.g + ', ' + colorOnScreen.b
      colorCell.style.backgroundColor = 'rgb(' + cssRgb + ')'

      newRow.insertCell(0).appendChild(document.createTextNode(collectedColors.length))
      newRow.insertCell(1).appendChild(colorCell)
      newRow.insertCell(2).appendChild(document.createTextNode(getColor))
    }

    showRandomColor()
  }

  for (let i = 0; i < classifyButtonSelector.length; i++) {
    classifyButtonSelector[i].addEventListener('click', classifyButton, false)
  }
}

const predict = (props) => {
  tf.tidy(() => {
    const input = tf.tensor2d([
      [props.r, props.g, props.b]
    ])
    const results = model.predict(input)
    const argMax = results.argMax(1)
    const index = argMax.dataSync()[0]
    const label = labelList[index]
    document.getElementById('label').innerHTML = 'label: ' + label
  })
}

const train = async () => {
  const data = collectedColors

  const colors = []
  const labels = []
  for (const record of data) {
    const col = [record.r / 255, record.g / 255, record.b / 255]
    colors.push(col)
    labels.push(labelList.indexOf(record.label))
  }

  const xs = tf.tensor2d(colors)
  const labelsTensor = tf.tensor1d(labels, 'int32')

  const ys = tf.oneHot(labelsTensor, 9).cast('float32')
  labelsTensor.dispose()

  model = tf.sequential()
  const hidden = tf.layers.dense({
    units: 100,
    inputShape: [3],
    activation: 'sigmoid'
  })
  const output = tf.layers.dense({
    units: 9,
    activation: 'softmax'
  })
  model.add(hidden)
  model.add(output)

  const learningRate = 0.9
  const optimizer = tf.train.sgd(learningRate)

  model.compile({
    optimizer: optimizer,
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy']
  })

  const colorWillPredictSelector = document.getElementById('colorWillPredict')
  const getColorValue = hexToRgb(colorWillPredictSelector.value)

  trained = true

  const trainResultsSelector = document.getElementById('trainResults').getElementsByTagName('tbody')[0]
  trainResultsSelector.innerHTML = ''

  await model.fit(xs, ys, {
    shuffle: true,
    validationSplit: 0.1,
    epochs: 100,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        const newRow = trainResultsSelector.insertRow(0)
        const firstCell = newRow.insertCell(0)
        const secondCell = newRow.insertCell(1)
        const firstCellText = document.createTextNode(epoch)
        const secondCellText = document.createTextNode(logs.loss.toFixed(5))
        firstCell.appendChild(firstCellText)
        secondCell.appendChild(secondCellText)

        predict({
          r: getColorValue.r,
          g: getColorValue.g,
          b: getColorValue.b
        })
      },
      onTrainEnd: () => {
        console.log('train finished')
      }
    }
  })
}

const trainData = async () => {
  const trainDataSelector = document.getElementById('trainData')
  trainDataSelector.addEventListener('click', function () {
    train()
  })

  const trainWithExampleDataSelector = document.getElementById('trainWithExampleData')
  trainWithExampleDataSelector.addEventListener('click', async function () {
    const getJson = await window.fetch('./myColorData.json')
    const jsonData = await getJson.json()
    collectedColors = jsonData

    const selectedColorsSelector = document.getElementById('selectedColors').getElementsByTagName('tbody')[0]
    selectedColorsSelector.innerHTML = ''

    for (let i = 0; i < collectedColors.length; i++) {
      const collectedColor = collectedColors[i]

      const newRow = selectedColorsSelector.insertRow(0)

      const colorCell = document.createElement('div')
      const cssRgb = collectedColor.r + ', ' + collectedColor.g + ', ' + collectedColor.b
      colorCell.style.backgroundColor = 'rgb(' + cssRgb + ')'

      newRow.insertCell(0).appendChild(document.createTextNode(i + 1))
      newRow.insertCell(1).appendChild(colorCell)
      newRow.insertCell(2).appendChild(document.createTextNode(collectedColor.label))
    }

    train()
  })
}

const predictColor = () => {
  const colorWillPredictSelector = document.getElementById('colorWillPredict')
  const selectedColorSelector = document.getElementById('selectedColor')

  colorWillPredictSelector.addEventListener('change', function (e) {
    const getColor = e.target.value
    const convertToRgb = hexToRgb(getColor)
    selectedColorSelector.innerHTML = getColor

    if (trained) {
      predict(convertToRgb)
    }
  })
}

/* 1. show random color */
showRandomColor()
/* 2. classify colors */
classifyColors()
/* 3. train data */
trainData()
/* 4. predict color */
predictColor()
