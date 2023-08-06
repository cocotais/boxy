let behavior_table = {}
let history = []

export function register(name, behavior) {
  behavior_table[name] = behavior
}

export function call(sender, receiver, behavior, ...args) {
  history.push({ sender: sender, receiver: receiver, behavior: behavior })
  behavior_table[behavior](...args)
  console.log(history)
}
