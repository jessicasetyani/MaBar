// MaBar UI Component Library
// Material Design 3 compliant components

export { default as LoadingSpinner } from './LoadingSpinner.vue'
export { default as FeedbackAlert } from './FeedbackAlert.vue'
export { default as SkeletonLoader } from './SkeletonLoader.vue'
export { default as IconButton } from './IconButton.vue'
export { default as CalendarLoadingState } from './CalendarLoadingState.vue'
export { default as CalendarErrorState } from './CalendarErrorState.vue'
export { default as FloatingActionButton } from './FloatingActionButton.vue'
export { default as EnhancedFloatingActionButton } from './EnhancedFloatingActionButton.vue'

// Component usage examples and guidelines:

/*
LoadingSpinner:
<LoadingSpinner size="md" :show-text="true" text="Loading data..." />

FeedbackAlert:
<FeedbackAlert 
  type="success" 
  title="Success!" 
  message="Your profile has been updated." 
  @dismiss="handleDismiss" 
/>

SkeletonLoader:
<SkeletonLoader type="card" />
<SkeletonLoader type="list-item" />

IconButton:
<IconButton 
  variant="filled" 
  size="md" 
  aria-label="Add new item"
  @click="handleAdd"
>
  <template #icon>
    <PlusIcon />
  </template>
</IconButton>
*/
