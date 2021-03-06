import React from 'react'
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store'
import { shallow, mount } from 'enzyme'
import { TOGGLE_SEND_PANE } from '../../app/modules/dashboard'
import { CLEAR_TRANSACTION, SEND_TRANSACTION, TOGGLE_ASSET } from '../../app/modules/transactions'
import Send from '../../app/components/Send'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'

jest.useFakeTimers()
jest.mock('neon-js')

const axiosMock = new MockAdapter(axios)
axiosMock.onAny().reply(200)

const initialState = {
  account: {
    wif: 'L4SLRcPgqNMAMwM3nFSxnh36f1v5omjPg3Ewy1tg2PnEon8AcHou',
    address: 'AWy7RNBVr9vDadRMK9p7i7Z1tL7GrLAxoh'
  },
  metadata: {
    network: 'TestNet'
  },
  wallet: {
    Neo: 5,
    Gas: 1
  },
  transactions: {
    selectedAsset: 'Neo'
  },
  dashboard: {
    confirmPane: true
  }
}

const setup = (state = initialState, shallowRender = true) => {
  const store = configureStore()(state)

  let wrapper
  if (shallowRender) {
    wrapper = shallow(<Send store={store} />)
  } else {
    wrapper = mount(
      <Provider store={store}>
        <Send />
      </Provider>
    )
  }

  return {
    store,
    wrapper
  }
}

const mockTimeouts = (callNum, time) => {
  jest.runAllTimers(callNum)
  expect(setTimeout.mock.calls.length).toBe(callNum)
  expect(setTimeout.mock.calls[callNum - 1][1]).toBe(time)
}

describe('Send', () => {
  test('renders without crashing', (done) => {
    const { wrapper } = setup()
    expect(wrapper).toMatchSnapshot()
    done()
  })

  test('toggleAsset button is getting called on click', (done) => {
    const { wrapper, store } = setup()
    const deepWrapper = wrapper.dive()

    deepWrapper.find('#sendAsset').simulate('click')

    const actions = store.getActions()
    expect(actions.length === 1).toEqual(true)
    expect(actions[0].type === TOGGLE_ASSET).toEqual(true)
    done()
  })

  test('sendAsset button is getting called correctly for NEO with various fields filled correctly and incorrectly', (done) => {
    const { wrapper, store } = setup(initialState, false)

    wrapper.find('#doSend').simulate('click')

    mockTimeouts(1, 5000)
    const actions = store.getActions()
    expect(actions.length === 2).toEqual(true)
    expect(actions[0]).toEqual({
      type: SEND_TRANSACTION,
      success: false,
      message: 'The address you entered was not valid.'
    })
    expect(actions[1]).toEqual({
      type: CLEAR_TRANSACTION
    })
    store.clearActions()

    const addressField = wrapper.find('input[placeholder="Where to send the asset (address)"]')
    addressField.instance().value = initialState.account.address
    addressField.simulate('change')

    wrapper.find('#doSend').simulate('click')

    mockTimeouts(2, 5000)
    const actions2 = store.getActions()
    expect(actions2.length === 2).toEqual(true)
    expect(actions2[0]).toEqual({
      type: SEND_TRANSACTION,
      success: false,
      message: 'You cannot send fractional amounts of Neo.'
    })
    expect(actions2[1]).toEqual({
      type: CLEAR_TRANSACTION
    })
    store.clearActions()

    const neoField = wrapper.find('input[placeholder="Amount"]')
    neoField.instance().value = initialState.wallet.Neo + 1
    neoField.simulate('change')

    wrapper.find('#doSend').simulate('click')

    mockTimeouts(3, 5000)
    const actions3 = store.getActions()
    expect(actions3.length === 2).toEqual(true)
    expect(actions3[0]).toEqual({
      type: SEND_TRANSACTION,
      success: false,
      message: 'You do not have enough NEO to send.'
    })
    expect(actions3[1]).toEqual({
      type: CLEAR_TRANSACTION
    })
    store.clearActions()

    neoField.instance().value = -1
    neoField.simulate('change')

    wrapper.find('#doSend').simulate('click')

    mockTimeouts(4, 5000)
    const actions4 = store.getActions()
    expect(actions4.length === 2).toEqual(true)
    expect(actions4[0]).toEqual({
      type: SEND_TRANSACTION,
      success: false,
      message: 'You cannot send negative amounts of an asset.'
    })
    expect(actions4[1]).toEqual({
      type: CLEAR_TRANSACTION
    })
    store.clearActions()

    neoField.instance().value = initialState.wallet.Neo - 1
    neoField.simulate('change')

    wrapper.find('#doSend').simulate('click')

    const actions5 = store.getActions()
    expect(actions5.length === 1).toEqual(true)
    expect(actions5[0]).toEqual({
      type: TOGGLE_SEND_PANE,
      pane: 'confirmPane'
    })
    done()
  })

  test('sendAsset button is getting called correctly for GAS with various fields filled correctly and incorrectly', (done) => {
    const gasState = Object.assign({}, initialState, { transactions: { selectedAsset: 'Gas' } })
    const { wrapper, store } = setup(gasState, false)

    const addressField = wrapper.find('input[placeholder="Where to send the asset (address)"]')
    addressField.instance().value = initialState.account.address
    addressField.simulate('change')

    const gasField = wrapper.find('input[placeholder="Amount"]')
    gasField.instance().value = initialState.wallet.Gas + 1
    gasField.simulate('change')

    wrapper.find('#doSend').simulate('click')

    mockTimeouts(5, 5000)
    const actions = store.getActions()
    expect(actions.length === 2).toEqual(true)
    expect(actions[0]).toEqual({
      type: SEND_TRANSACTION,
      success: false,
      message: 'You do not have enough GAS to send.'
    })
    expect(actions[1]).toEqual({
      type: CLEAR_TRANSACTION
    })
    store.clearActions()

    gasField.instance().value = initialState.wallet.Gas - 0.5
    gasField.simulate('change')

    wrapper.find('#doSend').simulate('click')

    const actions1 = store.getActions()
    expect(actions1.length === 1).toEqual(true)
    expect(actions1[0]).toEqual({
      type: TOGGLE_SEND_PANE,
      pane: 'confirmPane'
    })
    done()
  })

  test('send transaction is working correctly', (done) => {
    const { wrapper, store } = setup(initialState, false)

    const addressField = wrapper.find('input[placeholder="Where to send the asset (address)"]')
    addressField.instance().value = initialState.account.address
    addressField.simulate('change')

    const neoField = wrapper.find('input[placeholder="Amount"]')
    neoField.instance().value = initialState.wallet.Neo - 1
    neoField.simulate('change')

    wrapper.find('#confirmPane').simulate('click')

    jest.runAllTimers()
    // NOTE: there should be an additional 2 actions here
    // But I am unable to delay the store.getActions call
    // in order to wait for the doSendAsset promise to resolve
    // see Send.js ~line 80 where the issue is occuring.
    // I tried adding a setTimeout here but couldn't get it to work
    const actions = store.getActions()
    expect(actions.length === 2).toEqual(true)
    expect(actions[0]).toEqual({
      type: SEND_TRANSACTION,
      success: true,
      message: 'Processing...'
    })
    expect(actions[1]).toEqual({
      type: TOGGLE_SEND_PANE,
      pane: 'confirmPane'
    })
    done()
  })

  test('component is rendering correctly', (done) => {
    const { wrapper } = setup()
    const deepWrapper = wrapper.dive()

    const checkElements = [
      {
        element: deepWrapper.find('#sendAsset'),
        text: 'Neo'
      },
      {
        element: deepWrapper.find('#sendAmount'),
        text: ''
      },
      {
        element: deepWrapper.find('#sendAddress'),
        text: ''
      },
      {
        element: deepWrapper.find('#doSend'),
        text: 'Send Asset'
      },
      {
        element: deepWrapper.find('#confirmPane'),
        text: 'Confirm Transaction'
      }
    ]

    checkElements.forEach(item => {
      expect(item.element.length).toEqual(1)
      expect(item.element.text()).toEqual(item.text)
    })
    done()
  })
})
