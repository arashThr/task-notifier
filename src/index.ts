import notifier from 'node-notifier'
import path from 'node:path'
import { appendFile } from 'node:fs/promises'

const historyFile = 'tasks_history.md'

function timeout(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function startTimer(seconds: number, desc: string) {
  const start = new Date()
  await timeout(seconds * 1000)
  const iconPath = path.join(__dirname, 'task.jpg')
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
    const outcome =
      response === 'timeout' ? 'TIMEOUT' :
      response === 'activate' && meta?.activationValue === 'Mark as done' ? 'DONE' :
      response === 'closed' || meta?.activationValue === undefined ? 'FAILED' : 'UNKNOWN'
    appendFile(historyFile, `${start.toLocaleString()} - ${seconds < 60 ? seconds + 's' : (seconds / 60) + 'm'} (${outcome}) => ${desc}\n`)
  })
}

const [duration, ...desc] = process.argv.slice(2)
if (duration && desc) {
  let seconds =
    duration.endsWith('s') ? parseInt(duration.slice(0, -1)) :
    duration.endsWith('m') ? parseInt(duration.slice(0, -1)) * 60 : parseInt(duration) * 60
  startTimer(seconds, desc.join(' '))
}
else
  console.error('Require duration and description')

