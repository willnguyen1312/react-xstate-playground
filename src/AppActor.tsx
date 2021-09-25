import {
  createMachine,
  interpret,
  send,
  sendParent,
  assign,
  spawn,
} from "xstate";

const remoteMachine = createMachine({
  id: "remote",
  initial: "offline",
  states: {
    offline: {
      on: {
        WAKE: "online",
      },
    },
    online: {
      after: {
        1000: {
          actions: sendParent("REMOTE.ONLINE"),
        },
      },
    },
  },
});

let a = spawn(remoteMachine);

const parentMachine = createMachine<{ localOne: any }>({
  id: "parent",
  initial: "waiting",
  context: {
    localOne: null,
  },
  states: {
    waiting: {
      entry: assign({
        localOne: () => spawn(remoteMachine),
      }),
      on: {
        "LOCAL.WAKE": {
          actions: send(
            { type: "WAKE" },
            { to: (context) => context.localOne }
          ),
        },
        "REMOTE.ONLINE": { target: "connected" },
      },
    },
    connected: {},
  },
});

const parentService = interpret(parentMachine)
  .onTransition((state) => console.log(state.value))
  .start();

parentService.send({ type: "LOCAL.WAKE" });
