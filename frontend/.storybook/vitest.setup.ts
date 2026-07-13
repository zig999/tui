import { beforeAll } from "vitest";
import { setProjectAnnotations } from "@storybook/react-vite";
import * as projectAnnotations from "./preview";

// Applies the Storybook project annotations (decorators, parameters, globals)
// to every story run as a component test via addon-vitest.
const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
