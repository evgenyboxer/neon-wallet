// @flow
import React, { Component } from 'react'
import classNames from 'classnames'
import { isNil } from 'lodash'

import Claim from '../Claim'

import Tooltip from '../../components/Tooltip'

import { formatGAS, formatFiat } from '../../core/formatters'
import { ASSETS } from '../../core/constants'

import MdSync from 'react-icons/lib/md/sync'

import styles from './WalletInfo.scss'

import TokensBalance from './TokensBalance'

type Props = {
  address: string,
  neo: number,
  net: NetworkType,
  gas: number,
  neoPrice: number,
  gasPrice: number,
  tokens: Object,
  loadWalletData: Function,
  showSuccessNotification: Function,
  showErrorNotification: Function,
  showModal: Function,
  retrieveTokenInfo: Function
}

export default class WalletInfo extends Component<Props> {
  refreshBalance = () => {
    const {
      showSuccessNotification,
      showErrorNotification,
      loadWalletData,
      net,
      address
    } = this.props
    loadWalletData(net, address).then((response) => {
      showSuccessNotification({ message: 'Received latest blockchain information.' })
    }).catch(() => {
      showErrorNotification({ message: 'Failed to retrieve blockchain information' })
    })
  }

  render () {
    const {
      address,
      neo,
      gas,
      neoPrice,
      gasPrice,
      tokens,
      showModal,
      retrieveTokenInfo
    } = this.props

    if (isNil(address)) {
      return null
    }

    let neoValue = neoPrice && neo ? neoPrice * neo : 0
    let gasValue = gasPrice && gas ? gasPrice * gas : 0
    let totalValue = neoValue + gasValue

    return (
      <div id='accountInfo'>
        <div id='balance'>
          <div className='split'>
            <div className='label'>{ASSETS.NEO}</div>
            <div className='amountBig amountNeo'>{neo}</div>
            <div className='fiat neoWalletValue'>US ${formatFiat(neoValue)}</div>
          </div>
          <div className='split'>
            <div className='label'>{ASSETS.GAS}</div>
            <div className='amountBig amountGas'>
              <Tooltip title={formatGAS(gas)} disabled={gas === 0}>{formatGAS(gas, true)}</Tooltip>
            </div>
            <div className='fiat gasWalletValue'>US ${formatFiat(gasValue)}</div>
          </div>
          <div className='fiat walletTotal'>Total US ${formatFiat(totalValue)}</div>
          <div onClick={this.refreshBalance} className={classNames(styles.refreshIconContainer, 'refreshBalance')}>
            <Tooltip title='Refresh account balance'>
              <MdSync id='refresh' className={styles.refreshIcon} />
            </Tooltip>
          </div>
        </div>
        <div className='spacer' />
        <Claim />
        <TokensBalance tokens={tokens} showModal={showModal} retrieveTokenInfo={retrieveTokenInfo} />
      </div>
    )
  }
}
