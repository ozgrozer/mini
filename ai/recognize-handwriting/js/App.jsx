const React = window.React

let _canvas = [
  { letter: 'A', squares: { 'l00': {}, 'l01': {}, 'l02': {} } },
  { letter: 'B', squares: { 'l10': {}, 'l11': {}, 'l12': {} } }
]
let drawAndGuess = {}

const nextLetter = (letter) => {
  return letter.substring(0, letter.length - 1) + String.fromCharCode(letter.charCodeAt(letter.length - 1) + 1)
}
const ucfirst = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

const App = () => {
  const [guessResult, setGuessResult] = React.useState(null)
  const [network, setNetwork] = React.useState(null)
  const [networkIsTraining, setNetworkIsTraining] = React.useState(false)
  const [trainingCompleted, setTrainingCompleted] = React.useState(null)
  const [canvas, setCanvas] = React.useState(_canvas)

  const _trainingCompleted = () => {
    setNetworkIsTraining(false)
    setTrainingCompleted(true)
  }

  const trainNeuralNetwork = () => {
    const data = []

    canvas.map((item1, i1) => {
      Object.keys(item1.squares).map((id) => {
        const drawable = item1.squares[id]
        const input = drawable.getVector()
        const output = { [item1.letter]: 1 }

        if (input.indexOf(1)) {
          data.push({ input: input, output: output })
        }
      })
    })

    setNetworkIsTraining(true)

    if (window.Worker) {
      const worker = new window.Worker('./js/worker.js')
      worker.postMessage(JSON.stringify(data))
      worker.onmessage = (e) => {
        const data = JSON.parse(e.data)

        if (data.type === 'result') {
          const train = new window.brain.NeuralNetwork().fromJSON(data.net)
          setNetwork(train)

          _trainingCompleted()
        }
      }
    } else {
      const net = new window.brain.NeuralNetwork()
      const train = net.train(data, { iterations: 50, log: false })
      setNetwork(train)

      _trainingCompleted()
    }
  }

  const newNode = (opts) => {
    const i1 = opts.i1
    const objectLength = Object.keys(_canvas[i1].squares).length
    const id = 'l' + i1 + objectLength
    _canvas[i1].squares[id] = {}
    setCanvas(_canvas)
    setTimeout(() => {
      addNewCanvas({ i1: i1, id: id })
    }, 100)
  }

  const guess = () => {
    const run = network.run(drawAndGuess.getVector())
    const likely = window.brain.likely(drawAndGuess.getVector(), network)
    drawAndGuess.reset()

    const result = 'It\'s ' + likely + '.' + '\n' + JSON.stringify(run, null, 2)
    setGuessResult(result)
  }

  const updateLetter = (i1, e) => {
    canvas[i1].letter = e.target.value
    setCanvas(canvas)

    if (document.activeElement && e.target.value) {
      document.activeElement.blur()
    }
  }

  const newLetter = () => {
    const canvasLength = canvas.length
    const lastItem = canvas[canvasLength - 1]
    const lastItemLength = Object.keys(lastItem.squares).length
    const letter = ucfirst(nextLetter(lastItem.letter))

    const squares = {}
    for (let i = 0; i < lastItemLength; i++) {
      squares['l' + canvasLength + '' + i] = {}
    }

    _canvas.push({ letter: letter, squares: squares })
    setCanvas(_canvas)

    setTimeout(() => {
      const lastItem = canvasLength
      Object.keys(canvas[lastItem].squares).map((id) => {
        addNewCanvas({ i1: lastItem, id: id })
      })
    }, 100)
  }

  return (
    <React.Fragment>
      <div className='section p-20'>
        <div className='title'>1. Classify your handwriting.</div>

        {canvas.map((item1, i1) => {
          return (
            <div key={i1} className='letter'>
              <div className='square'>
                <div className='dt'>
                  <div className='dtc'>
                    <form onSubmit={e => { e.preventDefault() }}>
                      <input
                        type='text'
                        maxLength='1'
                        defaultValue={item1.letter}
                        onChange={e => { updateLetter(i1, e) }} />
                    </form>
                  </div>
                </div>
              </div>

              {Object.keys(item1.squares).map((id) => (
                <canvas key={id} id={id} width='200' height='200' />
              ))}

              <div className='square'>
                <div className='dt'>
                  <div className='dtc'>
                    <button
                      onClick={() => { newNode({ i1: i1 }) }}
                      className='btn btn-primary newNodeButton'>
                      New Node ({item1.letter})
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        <div className='letter'>
          <div className='square'>
            <div className='dt'>
              <div className='dtc'>
                <button
                  onClick={newLetter}
                  className='btn btn-primary'>
                  New Letter
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='section'>
        <div className='title'>2. Train neural network.</div>

        <button
          onClick={trainNeuralNetwork}
          className={'btn btn-primary btn-lg mt-20' + (networkIsTraining ? ' disabled' : '')}>
          {
            networkIsTraining
            ? 'NEURAL NETWORK IS TRAINING NOW'
            : trainingCompleted
              ? 'TRAINING COMPLETED'
              : 'TRAIN NEURAL NETWORK'
          }
        </button>

        <div className='description mt-20'>
          {
            window.Worker
            ? (
              <p>
                Your browser supports Web Workers.<br />
                Training will be executed in background thread.
              </p>
              )
            : (
              <p>
                Your browser doesn't support Web Workers.<br />
                Training may be interfered with the UI.
              </p>
              )
          }
        </div>
      </div>

      <div className='section p-20'>
        <div className='title'>3. Draw and guess.</div>

        <div className='letter'>
          <canvas id='drawAndGuess' width='200' height='200' />

          <div className='square'>
            <div className='dt'>
              <div className='dtc'>
                <button
                  onClick={guess}
                  disabled={!trainingCompleted || false}
                  className={'btn btn-primary' + (!trainingCompleted ? ' disabled' : '')}>
                  Guess
                </button>
              </div>
            </div>
          </div>

          <textarea className='guessResult form-control' value={guessResult || 'Guess Result'} />
        </div>
      </div>
    </React.Fragment>
  )
}

window.ReactDOM.render(<App />, document.getElementById('root'))

function addNewCanvas (opts) {
  _canvas[opts.i1].squares[opts.id] = new window.DrawableCanvas(document.getElementById(opts.id))
}

_canvas.map((item1, i1) => {
  Object.keys(item1.squares).map((id) => {
    addNewCanvas({ i1: i1, id: id })
  })
})

drawAndGuess = new window.DrawableCanvas(document.getElementById('drawAndGuess'))
