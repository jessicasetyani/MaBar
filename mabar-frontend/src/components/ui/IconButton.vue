<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-label="ariaLabel"
    :class="buttonClasses"
    class="touch-target transition-standard focus-visible"
    @click="$emit('click', $event)"
  >
    <slot name="icon">
      <div :class="iconSizeClass" v-html="iconSvg"></div>
    </slot>
    <span v-if="label" class="md-label-large">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: 'filled' | 'outlined' | 'text'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  ariaLabel: string
  label?: string
  iconSvg?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'text',
  size: 'md',
  disabled: false,
  type: 'button',
})

defineEmits<{
  click: [event: MouseEvent]
}>()

const buttonClasses = computed(() => {
  const base = 'inline-flex items-center justify-center gap-2 rounded-full'

  const variants = {
    filled:
      'bg-md-sys-color-primary text-md-sys-color-on-primary hover:md-elevation-1',
    outlined:
      'border border-md-sys-color-outline text-md-sys-color-primary hover:bg-black/8',
    text: 'text-md-sys-color-primary hover:bg-black/8',
  }

  const sizes = {
    sm: 'h-8 w-8 p-1',
    md: 'h-10 w-10 p-2',
    lg: 'h-12 w-12 p-3',
  }

  const disabled = props.disabled ? 'opacity-38 pointer-events-none' : ''

  return `${base} ${variants[props.variant]} ${sizes[props.size]} ${disabled}`
})

const iconSizeClass = computed(() => {
  const sizes = {
    sm: 'icon-sm',
    md: 'icon-md',
    lg: 'icon-lg',
  }
  return sizes[props.size]
})
</script>
