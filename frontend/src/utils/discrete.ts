import { createDiscreteApi } from "naive-ui";

/**
 * Creates a discrete Naive UI API instance for programmatic access
 * to message and loadingBar outside of Vue component setup context.
 *
 * @returns Destructured message and loadingBar APIs from Naive UI
 */
const { message, loadingBar } = createDiscreteApi(["message", "loadingBar"]);

export { message, loadingBar };
