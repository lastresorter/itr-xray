import { useTranslation } from 'react-i18next';
import { Modal } from 'antd';
import { GithubOutlined } from '@ant-design/icons';

import { formatPanelVersion } from '@/lib/panel-version';
import ItrLogo from './ItrLogo';
import './AboutModal.css';

export const UPSTREAM_URL = 'https://github.com/MHSanaei/3x-ui';

export default function AboutModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const version = window.X_UI_CUR_VER || '';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      title={null}
      className="itr-about"
    >
      <div className="itr-about-hero">
        <ItrLogo height={26} />
        <span className="itr-about-product">itr-xray</span>
      </div>
      <p className="itr-about-description">{t('about.tagline')}</p>
      {version && (
        <div className="itr-about-row">
          <span>{t('about.version')}</span>
          <b>{formatPanelVersion(version)}</b>
        </div>
      )}
      <div className="itr-about-credits">
        <p>{t('about.basedOn')}</p>
        <a href={UPSTREAM_URL} target="_blank" rel="noopener noreferrer">
          <GithubOutlined /> github.com/MHSanaei/3x-ui
        </a>
        <p className="itr-about-license">{t('about.license')}</p>
      </div>
    </Modal>
  );
}
