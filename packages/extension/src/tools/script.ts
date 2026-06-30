import type { DebuggerBridge } from "../debugger.js";

export async function handleScript(
  bridge: DebuggerBridge,
  tabId: number,
  params: Record<string, unknown>
): Promise<unknown> {
  const expression = params.expression as string;
  if (!expression) throw new Error("expression is required");

  const result = await bridge.sendCommand(tabId, "Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });

  const res = result as any;
  if (res.exceptionDetails) {
    throw new Error(
      res.exceptionDetails.text ||
        res.exceptionDetails.exception?.description ||
        "JavaScript evaluation error"
    );
  }

  return res.result?.value;
}
