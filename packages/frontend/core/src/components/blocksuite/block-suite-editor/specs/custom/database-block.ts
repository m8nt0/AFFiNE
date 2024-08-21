import { notify } from '@affine/component';
import { getAffineCloudBaseUrl } from '@affine/core/modules/cloud/services/fetch';
import { I18n } from '@affine/i18n';
import type { DatabaseBlockModel, MenuOptions } from '@blocksuite/blocks';
import { LinkIcon } from '@blocksuite/icons/lit';
import {
  DocsService,
  type FrameworkProvider,
  WorkspaceService,
} from '@toeverything/infra';

export function createDatabaseOptionsConfig(framework: FrameworkProvider) {
  return {
    configure: (model: DatabaseBlockModel, options: MenuOptions) => {
      const items = options.items;

      const copyIndex = items.findIndex(
        item => item.type === 'action' && item.name === 'Copy'
      );

      items.splice(
        copyIndex + 1,
        0,
        createCopyLinkToBlockMenuItem(framework, model)
      );

      return options;
    },
  };
}

function createCopyLinkToBlockMenuItem(
  framework: FrameworkProvider,
  model: DatabaseBlockModel,
  item = {
    icon: LinkIcon({ width: '20', height: '20' }),
    type: 'action',
    name: 'Copy link to block',
  }
) {
  return {
    ...item,
    hide: () => {
      const docsService = framework.get(DocsService);
      const pageId = model.doc.id;
      const mode = docsService.list.getPrimaryMode(pageId) ?? 'page';
      return mode === 'edgeless';
    },
    select: () => {
      const baseUrl = getAffineCloudBaseUrl();
      if (!baseUrl) return;

      let str;

      // mode = page | edgeless
      // `?mode={mode}&blockId={bid}`
      // `?mode={mode}&elementId={eid}`
      try {
        const docsService = framework.get(DocsService);
        const pageId = model.doc.id;
        const mode = docsService.list.getPrimaryMode(pageId) ?? 'page';
        if (mode === 'edgeless') return;

        const workspace = framework.get(WorkspaceService).workspace;
        const workspaceId = workspace.id;
        const url = new URL(`${baseUrl}/workspace/${workspaceId}/${pageId}`);
        const searchParams = url.searchParams;

        searchParams.append('mode', mode);
        searchParams.append('blockId', model.id);

        str = url.toString();
      } catch (e) {
        console.error(e);
      }

      if (!str) return;

      navigator.clipboard
        .writeText(str)
        .then(() => {
          notify.success({
            title: I18n['Copied link to clipboard'](),
          });
        })
        .catch(console.error);
    },
  };
}
