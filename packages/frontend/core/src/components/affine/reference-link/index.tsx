import { useDocMetaHelper } from '@affine/core/hooks/use-block-suite-page-meta';
import { useJournalHelper } from '@affine/core/hooks/use-journal';
import {
  PeekViewService,
  useInsidePeekView,
} from '@affine/core/modules/peek-view';
import { WorkbenchLink } from '@affine/core/modules/workbench';
import { useI18n } from '@affine/i18n';
import {
  BlockLinkIcon,
  DeleteIcon,
  LinkedEdgelessIcon,
  LinkedPageIcon,
  TodayIcon,
} from '@blocksuite/icons/rc';
import type { DocCollection } from '@blocksuite/store';
import {
  type DocMode,
  DocsService,
  LiveData,
  useLiveData,
  useService,
} from '@toeverything/infra';
import { type PropsWithChildren, useCallback, useRef } from 'react';

import * as styles from './styles.css';

export interface PageReferenceRendererOptions {
  docMode: DocMode | null;
  pageId: string;
  docCollection: DocCollection;
  pageMetaHelper: ReturnType<typeof useDocMetaHelper>;
  journalHelper: ReturnType<typeof useJournalHelper>;
  t: ReturnType<typeof useI18n>;

  // linking block/element
  blockId?: string[];
  elementId?: string[];
}
// use a function to be rendered in the lit renderer
export function pageReferenceRenderer({
  docMode,
  pageId,
  pageMetaHelper,
  journalHelper,
  t,

  blockId,
  elementId,
}: PageReferenceRendererOptions) {
  const { isPageJournal, getLocalizedJournalDateString } = journalHelper;
  const referencedPage = pageMetaHelper.getDocMeta(pageId);
  let title =
    referencedPage?.title ?? t['com.affine.editor.reference-not-found']();

  let Icon = DeleteIcon;

  if (referencedPage) {
    if (docMode === 'edgeless') {
      Icon = LinkedEdgelessIcon;
    } else {
      Icon = LinkedPageIcon;
    }
    if (blockId?.length || elementId?.length) {
      Icon = BlockLinkIcon;
    }
  }

  const isJournal = isPageJournal(pageId);
  const localizedJournalDate = getLocalizedJournalDateString(pageId);
  if (isJournal && localizedJournalDate) {
    title = localizedJournalDate;
    Icon = TodayIcon;
  }

  return (
    <>
      <Icon className={styles.pageReferenceIcon} />
      <span className="affine-reference-title">
        {title ? title : t['Untitled']()}
      </span>
    </>
  );
}

export function AffinePageReference({
  pageId,
  docCollection,
  wrapper: Wrapper,

  docMode,
  blockId,
  elementId,
}: {
  pageId: string;
  docCollection: DocCollection;
  wrapper?: React.ComponentType<PropsWithChildren>;

  docMode?: DocMode;
  blockId?: string[];
  elementId?: string[];
}) {
  const pageMetaHelper = useDocMetaHelper(docCollection);
  const journalHelper = useJournalHelper(docCollection);
  const t = useI18n();

  const docsService = useService(DocsService);
  const docPrimaryMode = useLiveData(
    LiveData.computed(get => {
      const primaryMode$ = get(docsService.list.doc$(pageId))?.primaryMode$;
      if (!primaryMode$) {
        return null;
      }
      return get(primaryMode$);
    })
  );
  const el = pageReferenceRenderer({
    docMode: docMode ?? docPrimaryMode,
    pageId,
    pageMetaHelper,
    journalHelper,
    docCollection,
    t,
    blockId,
    elementId,
  });

  const ref = useRef<HTMLAnchorElement>(null);

  const peekView = useService(PeekViewService).peekView;
  const isInPeekView = useInsidePeekView();

  const onClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.shiftKey && ref.current) {
        e.preventDefault();
        e.stopPropagation();
        peekView.open(ref.current).catch(console.error);
      }
      if (isInPeekView) {
        peekView.close();
      }
      return;
    },
    [isInPeekView, peekView]
  );

  // A block/element reference link
  const search = new URLSearchParams();
  if (docMode) {
    search.set('mode', docMode);
  }
  if (blockId?.length) {
    search.set('blockId', blockId.join(','));
  }
  if (elementId?.length) {
    search.set('elementId', elementId.join(','));
  }

  const query = search.size > 0 ? `?${search.toString()}` : '';

  return (
    <WorkbenchLink
      ref={ref}
      to={`/${pageId}${query}`}
      onClick={onClick}
      className={styles.pageReferenceLink}
    >
      {Wrapper ? <Wrapper>{el}</Wrapper> : el}
    </WorkbenchLink>
  );
}
