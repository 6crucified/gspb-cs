import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "./sentry.shared.config";

Sentry.init({
  ...sharedSentryOptions,
  integrations: [Sentry.replayIntegration()],
  replaysSessionSampleRate: 0.05,
  replaysOnErrorSampleRate: 1,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
