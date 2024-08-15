import { notify } from '@affine/component';
import { getAffineCloudBaseUrl } from '@affine/core/modules/cloud/services/fetch';
import { I18n } from '@affine/i18n';
import type { MoreMenuItemGroup } from '@blocksuite/affine-components/toolbar';
import type { MoreMenuContext } from '@blocksuite/blocks';
import { LinkIcon } from '@blocksuite/icons/lit';
import {
  DocsService,
  type FrameworkProvider,
  WorkspaceService,
} from '@toeverything/infra';

export function createToolbarMoreMenuConfig(framework: FrameworkProvider) {
  return {
    configure: <T extends MoreMenuContext>(groups: MoreMenuItemGroup<T>[]) => {
      const clipboardGroup = groups.find(group => group.type === 'clipboard');

      if (clipboardGroup) {
        const copyIndex = clipboardGroup.items.findIndex(
          item => item.type === 'copy'
        );
        clipboardGroup.items.splice(
          copyIndex + 1,
          0,
          createCopyLinkToBlockMenuItem(framework)
        );
      }

      return groups;
    },
  };
}

function createCopyLinkToBlockMenuItem(
  framework: FrameworkProvider,
  item = {
    icon: LinkIcon({ width: '20', height: '20' }),
    label: 'Copy link to block',
    type: 'copy-link-to-block',
    showWhile: (ctx: MoreMenuContext) => {
      if (ctx.isEmpty()) return false;

      const docsService = framework.get(DocsService);
      const pageId = ctx.doc.id;
      const mode = docsService.list.getPrimaryMode(pageId) ?? 'page';

      if (mode === 'edgeless') {
        // linking blocks in notes is currently not supported in edgeless mode.
        if (ctx.selectedBlockModels.length > 0) {
          return false;
        }

        // linking single block/element in edgeless mode.
        if (ctx.isMultiple()) {
          return false;
        }
      }

      return true;
    },
  }
) {
  return {
    ...item,
    action: (ctx: MoreMenuContext) => {
      const baseUrl = getAffineCloudBaseUrl();
      if (!baseUrl) return;

      let str;

      // mode = page | edgeless
      // `?mode={mode}&blockId={bid}`
      // `?mode={mode}&elementId={eid}`
      try {
        const workspace = framework.get(WorkspaceService).workspace;
        const docsService = framework.get(DocsService);
        const workspaceId = workspace.id;
        const pageId = ctx.doc.id;
        const mode = docsService.list.getPrimaryMode(pageId) ?? 'page';
        const url = new URL(`${baseUrl}/workspace/${workspaceId}/${pageId}`);
        const searchParams = url.searchParams;

        searchParams.append('mode', mode);
        if (mode === 'page') {
          // maybe multiple blocks
          const ids = ctx.selectedBlockModels.map(model => model.id);
          searchParams.append('blockId', ids.join(','));
        } else if (mode === 'edgeless' && ctx.firstElement) {
          // single block/element
          const id = ctx.firstElement.id;
          const key = ctx.isElement() ? 'element' : 'block';
          searchParams.append(`${key}Id`, id);
        }

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
