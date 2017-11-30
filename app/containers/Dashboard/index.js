// @flow
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { togglePane } from '../../modules/dashboard'
import { logout, getAddress } from '../../modules/account'
import { getBlockHeight, getNetwork } from '../../modules/metadata'
import { getNotifications, showErrorNotification } from '../../modules/notifications'
import { getNEOPrice, getGASPrice, getNEO, getGAS, getTokens, getIsLoaded, loadWalletData } from '../../modules/wallet'
import { showModal } from '../../modules/modal'
import { sendTransaction } from '../../modules/transactions'

import Dashboard from './Dashboard'

const mapStateToProps = (state: Object) => ({
  blockHeight: getBlockHeight(state),
  net: getNetwork(state),
  address: getAddress(state),
  neoPrice: getNEOPrice(state),
  gasPrice: getGASPrice(state),
  notification: getNotifications(state),
  neo: getNEO(state),
  gas: getGAS(state),
  tokens: getTokens(state),
  loaded: getIsLoaded(state)
})

const actionCreators = {
  togglePane,
  logout,
  showModal,
  showErrorNotification,
  sendTransaction,
  loadWalletData
}

const mapDispatchToProps = dispatch => bindActionCreators(actionCreators, dispatch)

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard)
