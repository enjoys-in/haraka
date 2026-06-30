import { PluginsView } from './PluginsView';

export function OutboundPluginsPage() {
  return (
    <PluginsView
      role="outbound"
      title="Outbound Plugins"
      description="Plugins that run while Haraka delivers mail it has accepted."
      intro="Outbound plugins sign, route and manage messages on their way out (DKIM signing, SRS, queue delivery and more). Enable / disable is saved to config/plugins and needs a Haraka restart to take effect; config edits are written to the plugin's file and picked up automatically — no restart needed."
    />
  );
}
