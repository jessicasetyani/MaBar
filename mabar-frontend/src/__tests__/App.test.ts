import { describe, it, expect } from 'vitest'
import { mountComponent } from '../tests/utils/test-utils'
import App from '../App.vue'
import { RouterView } from 'vue-router'

describe('App', () => {
  it('renders router-view', () => {
    const wrapper = mountComponent(App)
    expect(wrapper.findComponent(RouterView).exists()).toBe(true)
  })
})
