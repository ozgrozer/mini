importScripts('./../lib/js/brain.min.js')

onmessage = (e) => {
  const data = JSON.parse(e.data)
  const net = new brain.NeuralNetwork()

  net.train(data, { iterations: 50 })

  postMessage(JSON.stringify({ type: 'result', net: net.toJSON() }))
}
