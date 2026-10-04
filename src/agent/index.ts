import { Mastra } from "@mastra/core";

import { watts } from "./watts";

export const mastra = new Mastra({
	agents: { watts },
});
