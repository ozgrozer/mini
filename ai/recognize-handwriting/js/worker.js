importScripts('./../lib/js/brain.min.js')

onmessage = (e) => {
  const jsonParse = JSON.parse(e.data)

  const net = new brain.NeuralNetwork()

  const data = jsonParse.data
  const iterations = jsonParse.iterations
  const errorThreshold = jsonParse.errorThreshold
  const train = net.train(data, {
    iterations: iterations,
    errorThreshold: errorThreshold
  })

  postMessage(JSON.stringify({
    type: 'result',
    net: net.toJSON(),
    train: train,
    data: data
  }))
}
