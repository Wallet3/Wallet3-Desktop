import './DApps123.css';

import { Application } from '../../viewmodels/Application';
import DApps from '../../viewmodels/DAppsVM';
import { NetworksVM } from '../../viewmodels/NetworksVM';
import React from 'react';
import Shell from '../../bridges/Shell';
import UtilityBar from './components/UtilityBar';
import { WalletVM } from '../../viewmodels/WalletVM';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface IConstructor {
  app: Application;
  networksVM: NetworksVM;
  walletVM: WalletVM;
}

const LogoImage = ({ name }: { name: string }) => {
  let src = '';

  try {
    src = require(`../../../assets/icons/3rd/logos/${name.toLowerCase()}.svg`).default;
    return <img src={src} alt={name} />;
  } catch (error) {}

  try {
    src = require(`../../../assets/icons/3rd/logos/${name.toLowerCase()}.png`).default;
    return <img src={src} alt={name} />;
  } catch (error) {}
};

export default observer(({ app, networksVM, walletVM }: IConstructor) => {
  const { t } = useTranslation();
  const { currentChainId } = networksVM;
  const dapps = DApps[currentChainId];
  const categories = Object.getOwnPropertyNames(dapps || {});

  return (
    <div className="page dapps123">
      <UtilityBar app={app} networksVM={networksVM} walletVM={walletVM} />

      <div className="list">
        {dapps ? (
          categories.map((category) => {
            const projects = dapps[category] as { name: string; url: string }[];
            return (
              <div className="category" key={category}>
                <h3>{t(category)}</h3>

                <div className="projects">
                  {projects.map((project) => {
                    return (
                      <div
                        className="project"
                        key={project.url}
                        title={project.name}
                        onClick={(_) => Shell.open(project.url)}
                      >
                        <LogoImage name={project.name} />
                        <span>{project.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty">Nothing Here</div>
        )}
      </div>
    </div>
  );
});
