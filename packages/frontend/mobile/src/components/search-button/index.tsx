import { useI18n } from '@affine/i18n';
import { SearchIcon } from '@blocksuite/icons/rc';
import { Link } from 'react-router-dom';

import * as styles from './styles.css';

export const SearchButton = () => {
  const t = useI18n();
  return (
    <Link to="/search">
      <div className={styles.search}>
        <SearchIcon className={styles.icon} />
        {t['Quick search']()}
      </div>
    </Link>
  );
};
