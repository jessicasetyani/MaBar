import { describe, it, expect } from 'vitest'
import { mountComponent } from '../../tests/utils/test-utils'
import HelloWorld from '../HelloWorld.vue'

describe('HelloWorld', () => {
  it('renders properly', () => {
    const wrapper = mountComponent(HelloWorld, {
      props: { msg: 'Hello Vitest' },
    })
    expect(wrapper.text()).toContain('Hello Vitest')
  })

  it('increments count when button is clicked', async () => {
    const wrapper = mountComponent(HelloWorld, {
      props: { msg: 'Test' },
    })

    const button = wrapper.find('button')
    expect(button.text()).toContain('count is 0')

    await button.trigger('click')
    expect(button.text()).toContain('count is 1')
  })
})
