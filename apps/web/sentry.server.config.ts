import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "./sentry.shared.config";

Sentry.init(sharedSentryOptions);
