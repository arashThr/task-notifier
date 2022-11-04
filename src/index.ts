import notifier from 'node-notifier'
import path from 'node:path'
import { appendFile } from 'node:fs/promises'

const historyFile = 'tasks_history.md'

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function startTimer(duration: number, desc: string) {
  const start = new Date()
  await timeout(duration * 1000)
  const iconPath = path.join(__dirname, 'task.jpg')
  console.log(iconPath)
  notifier.notify({
    message: desc,
    actions: 'Mark as done',
    sound: true,
    wait: true,
    timeout: 30,
    icon: iconPath
  }, (err, response, meta) => {
    if (err)
      throw err
    console.log(response)
    console.log(meta?.activationValue)
    const outcome =
      response === 'timeout' ? 'TIMEOUT' :
      response === 'activate' && meta?.activationValue === 'Mark as done' ? 'DONE' :
      response === 'closed' || meta?.activationValue === undefined ? 'FAILED' : 'UNKNOWN'
    appendFile(historyFile, `${start.toLocaleString()} - ${duration}m (${outcome}) => ${desc}\n`)
  })
}

const [duration, ...desc] = process.argv.slice(2)
if (duration && desc)
  startTimer(parseInt(duration), desc.join(' '))
else
  console.error('Require duration and description')

