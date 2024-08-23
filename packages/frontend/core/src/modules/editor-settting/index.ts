import type { Framework } from '@toeverything/infra';

import { EditorSetting } from './entities/editor-setting';
import { EditorSettingProvider } from './provider/editor-setting-provider';
import { EditorSettingService } from './services/editor-setting';

export function configureEditorSettingModule(framework: Framework) {
  framework
    .service(EditorSettingService)
    .entity(EditorSetting, [EditorSettingProvider]);
}
