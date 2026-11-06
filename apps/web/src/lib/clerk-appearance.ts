import type { Appearance } from "@clerk/types";

export const CLERK_APPEARANCE: Appearance = {
  variables: {
    colorPrimary: "#6ea8ff",
    colorBackground: "#1c2433",
    colorInputBackground: "#1a2433",
    colorInputText: "#f4f7fb",
    colorText: "#f4f7fb",
    colorTextSecondary: "#c5d0de",
    colorNeutral: "#c5d0de",
    colorTextOnPrimaryBackground: "#0d1520",
    borderRadius: "0.75rem",
  },
  elements: {
    card: "border border-[#3d4c63] bg-[#1c2433] shadow-none",
    headerTitle: "text-[#f4f7fb]",
    headerSubtitle: "text-[#c5d0de]",
    socialButtonsBlockButton:
      "border border-[#5c6b82] bg-[#243246] text-[#f4f7fb] shadow-none hover:bg-[#2c3d54]",
    socialButtonsBlockButtonText: "!text-[#f4f7fb] font-medium",
    socialButtonsProviderIcon: "brightness-0 invert",
    dividerLine: "bg-[#3d4c63]",
    dividerText: "text-[#c5d0de]",
    formFieldLabel: "text-[#e7eef6]",
    formFieldInput:
      "border border-[#5c6b82] bg-[#121a26] text-[#f4f7fb] shadow-none placeholder:text-[#b7c4d4]",
    formFieldHintText: "text-[#c5d0de]",
    formButtonPrimary: "bg-[#6ea8ff] text-[#0d1520] shadow-none",
    footerActionText: "text-[#c5d0de]",
    footerActionLink: "text-[#9ec0ff]",
    identityPreviewText: "text-[#f4f7fb]",
    identityPreviewEditButton: "text-[#9ec0ff]",
    alertText: "text-[#f4f7fb]",
    otpCodeFieldInput: "border border-[#5c6b82] bg-[#121a26] text-[#f4f7fb]",
  },
};
