import { PluginsView } from './PluginsView';

export function InboundPluginsPage() {
  return (
    <PluginsView
      role="inbound"
      title="Inbound Plugins"
      description="Plugins that run while receiving mail from the outside world."
      intro="Inbound plugins filter, authenticate and score messages as they arrive. Enable / disable is saved to config/plugins and needs a Haraka restart to take effect; config edits are written to the plugin's file and picked up automatically — no restart needed."
    />
  );
}
