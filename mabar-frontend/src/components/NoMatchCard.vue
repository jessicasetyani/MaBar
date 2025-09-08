<template>
  <div class="no-match-card">
    <div class="no-match-header">
      <div class="no-match-icon">
        <svg fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
        </svg>
      </div>
      <div class="no-match-content">
        <h3 class="no-match-title">No Exact Matches Found</h3>
        <p class="no-match-message">{{ message }}</p>
      </div>
    </div>

    <div class="alternatives-section">
      <h4 class="alternatives-title">Here are some alternatives:</h4>
      
      <div class="alternative-options">
        <button @click="$emit('create-session')" class="alternative-button create-button">
          <svg class="button-icon" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <div class="button-content">
            <span class="button-title">Create New Session</span>
            <span class="button-subtitle">Start your own game and invite others</span>
          </div>
        </button>

        <button @click="$emit('modify-search')" class="alternative-button modify-button">
          <svg class="button-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
          </svg>
          <div class="button-content">
            <span class="button-title">Modify Search</span>
            <span class="button-subtitle">Try different time or location</span>
          </div>
        </button>

        <button @click="$emit('show-popular')" class="alternative-button popular-button">
          <svg class="button-icon" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <div class="button-content">
            <span class="button-title">Popular Sessions</span>
            <span class="button-subtitle">See what others are playing</span>
          </div>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message?: string
}

withDefaults(defineProps<Props>(), {
  message: 'We couldn\'t find sessions matching your exact criteria, but don\'t worry - we have some great alternatives!'
})

defineEmits<{
  'create-session': []
  'modify-search': []
  'show-popular': []
}>()
</script>

<script lang="ts">
export default {
  name: 'NoMatchCard'
}
</script>

<style scoped>
.no-match-card {
  background-color: #FFFFFF;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  margin: 16px 0;
  padding: 24px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.no-match-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.no-match-icon {
  width: 48px;
  height: 48px;
  background-color: #FEF3C7;
  color: #D97706;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.no-match-icon svg {
  width: 24px;
  height: 24px;
}

.no-match-content {
  flex: 1;
}

.no-match-title {
  font-size: 18px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 8px 0;
}

.no-match-message {
  font-size: 14px;
  color: #64748B;
  margin: 0;
  line-height: 1.5;
}

.alternatives-section {
  border-top: 1px solid #E5E7EB;
  padding-top: 20px;
}

.alternatives-title {
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin: 0 0 16px 0;
}

.alternative-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alternative-button {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  background-color: #FEFCE8;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.alternative-button:hover {
  border-color: #FDE047;
  background-color: #FFFBEB;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.alternative-button:focus {
  outline: none;
  border-color: #FDE047;
  box-shadow: 0 0 0 3px rgba(253, 224, 71, 0.3);
}

.button-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  padding: 8px;
}

.create-button .button-icon {
  background-color: #84CC16;
  color: #FFFFFF;
}

.modify-button .button-icon {
  background-color: #3B82F6;
  color: #FFFFFF;
}

.popular-button .button-icon {
  background-color: #F59E0B;
  color: #FFFFFF;
}

.button-icon svg {
  width: 20px;
  height: 20px;
}

.button-content {
  flex: 1;
}

.button-title {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 4px;
}

.button-subtitle {
  display: block;
  font-size: 14px;
  color: #64748B;
}

@media (max-width: 640px) {
  .no-match-card {
    padding: 20px;
  }
  
  .no-match-header {
    gap: 12px;
    margin-bottom: 20px;
  }
  
  .alternative-button {
    padding: 14px;
    gap: 12px;
  }
  
  .button-icon {
    width: 36px;
    height: 36px;
  }
}
</style>