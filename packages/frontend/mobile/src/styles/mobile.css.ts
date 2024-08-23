import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle } from '@vanilla-extract/css';

globalStyle('body', { height: 'auto' });
globalStyle('html', {
  overflowY: 'auto',
  background: cssVarV2('layer/background/secondary'),
});
