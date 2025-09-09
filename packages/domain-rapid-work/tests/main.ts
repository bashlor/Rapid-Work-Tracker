import { assert } from "@japa/assert";
import { expectTypeOf } from "@japa/expect-type";
import { configure, run } from "@japa/runner";

configure({
  plugins: [assert(), expectTypeOf()],
  suites: [
    {
      files: ["tests/features/**/*.spec.ts"],
      name: "features",
    },
  ],
});

run();
