"use client";

import { SettingSection } from "@/components/settings/card";
import { ExtensionPanel } from "@/components/extension-card";

export function ExtensionSection() {
  return (
    <SettingSection>
      <ExtensionPanel />
    </SettingSection>
  );
}
