import { createMachine } from "xstate";
import { assign } from "@xstate/immer";
import { useMachine } from "@xstate/react";

const toggleMachine = createMachine<{ data: { count: number } }>({
  id: "toggle",
  initial: "inactive",
  context: {
    data: {
      count: 0,
    },
  },
  states: {
    inactive: {
      on: { TOGGLE: "active" },
    },
    active: {
      entry: assign((ctx) => ctx.data.count++),
      on: { TOGGLE: "inactive" },
    },
  },
});

export default function App() {
  const [state, send] = useMachine(toggleMachine, { devTools: true });
  const active = state.matches("active");
  const {
    data: { count },
  } = state.context;

  return (
    <div>
      <button onClick={() => send("TOGGLE")}>
        Click me ({active ? "✅" : "❌"})
      </button>
      <code>
        Toggled <strong>{count}</strong> times
      </code>
    </div>
  );
}
