import './ConfirmTx.css';

import * as Anime from '../../misc/Anime';

import App, { ApplicationPopup } from '../../viewmodels/ApplicationPopup';

import { ConfirmVM } from '../../viewmodels/ConfirmVM';
import Icons from '../../misc/Icons';
import PasscodeView from '../../components/PasscodeView';
import { PopupTitle } from '../../components';
import React from 'react';
import TouchIDView from '../../components/TouchIDView';
import Window from '../../bridges/Window';
import anime from 'animejs';
import { observer } from 'mobx-react-lite';

interface Props {
  app: ApplicationPopup;
}

const authTouchID = async () => {
  if (await App.promptTouchID('Send Tx')) {
    Window.close();
  } else {
    Anime.vibrate('div.auth > .panel');
  }
};

const authPassword = async (passcode: string) => {
  const verified = await App.verifyPassword(passcode);

  if (!verified) {
    Anime.vibrate('div.auth > .panel');
    return;
  }

  Window.close();
};

const Methods = new Map<string, string[]>([
  ['0xa9059cbb', ['Transfer', 'repeat']],
  ['0x095ea7b3', ['Approve', 'shield']],
]);

export default observer(({ app }: Props) => {
  const onContinue = () => {
    anime({
      targets: '.page.confirm > .container > .details',
      translateX: '-100vw',
      easing: 'linear',
      opacity: 0,
      duration: 300,
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      translateX: ['100vw', 0],
      easing: 'linear',
      opacity: [0, 1],
      duration: 300,
      complete: () => (App.touchIDSupported ? authTouchID() : undefined),
    });
  };

  const onAuthCancel = () => {
    anime({
      targets: '.page.confirm > .container > .details',
      translateX: ['-100vw', 0],
      easing: 'linear',
      opacity: 1,
      duration: 300,
    });

    anime({
      targets: '.page.confirm > .container > .auth',
      translateX: [0, '100vw'],
      easing: 'linear',
      opacity: 0,
      duration: 300,
    });
  };

  const [title, icon] = Methods.get(app.implVM?.data?.substring(0, 10));

  return (
    <div className="page confirm">
      <PopupTitle title={title} icon={icon} />
      <div className="container">
        <TransferView implVM={app.implVM} onContinue={onContinue} />
        <AuthView app={app} onCancel={onAuthCancel} />
      </div>
    </div>
  );
});

const TransferView = observer(({ implVM, onContinue }: { implVM: ConfirmVM; onContinue?: () => void }) => {
  const { receiptAddress, receipt, amount, tokenSymbol, gas, gasPrice, maxFee, nonce } = implVM;

  return (
    <div className="details">
      <div className="form">
        <div>
          <span>Recipient:</span>
          <span title={receiptAddress}>{receipt}</span>
        </div>

        <div>
          <span>Amount:</span>
          <span>
            {amount} <img src={Icons(tokenSymbol)} alt={tokenSymbol} /> {tokenSymbol}
          </span>
        </div>

        <div>
          <span>Gas Limit:</span>
          <input type="text" defaultValue={gas} onChange={(e) => implVM.setGas(e.target.value)} />
        </div>

        <div>
          <span>Gas Price:</span>
          <div>
            <input type="text" defaultValue={gasPrice} onChange={(e) => implVM.setGasPrice(e.target.value)} />
            <span>Gwei</span>
          </div>
        </div>

        <div>
          <span>Nonce:</span>
          <input type="text" defaultValue={nonce} onChange={(e) => implVM.setNonce(e.target.value)} />
        </div>

        <div>
          <span>Max Fee:</span>
          <span>{maxFee} ETH</span>
        </div>
      </div>

      <div className="actions">
        <button onClick={(_) => Window.close()}>Cancel</button>
        <button disabled={!implVM.isValid || implVM.insufficientFee} onClick={(_) => onContinue?.()}>
          Continue
        </button>
      </div>
    </div>
  );
});

const AuthView = observer(({ app, onCancel }: { app: ApplicationPopup; onCancel?: () => void }) => {
  const { touchIDSupported } = app;

  return (
    <div className="auth">
      <div className="panel">
        {touchIDSupported ? <TouchIDView onAuth={authTouchID} /> : <PasscodeView onAuth={authPassword} />}
      </div>
      <button onClick={(_) => onCancel?.()}>Cancel</button>
    </div>
  );
});
