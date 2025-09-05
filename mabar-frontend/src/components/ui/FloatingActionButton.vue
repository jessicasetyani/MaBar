<template>
  <button
    :class="[
      'fixed bottom-6 right-6 z-[1000]',
      'w-14 h-14 rounded-full shadow-lg',
      'bg-primary text-text hover:bg-primary/90',
      'transition-all duration-200 ease-in-out',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
      'active:scale-95',
      'flex items-center justify-center',
      size === 'large' ? 'w-16 h-16' : 'w-14 h-14',
    ]"
    :aria-label="ariaLabel"
    @click="$emit('click')"
  >
    <slot>
      <svg
        class="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 4v16m8-8H4"
        />
      </svg>
    </slot>
  </button>
</template>

<script setup lang="ts">
interface Props {
  ariaLabel?: string
  size?: 'normal' | 'large'
}

withDefaults(defineProps<Props>(), {
  ariaLabel: 'Floating action button',
  size: 'normal',
})

defineEmits<{
  click: []
}>()
</script>
