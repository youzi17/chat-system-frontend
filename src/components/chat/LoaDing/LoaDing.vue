<template>
  <div :class="['loading', { 'loading--overlay': overlay }]">
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
      </div>
      
      <div v-if="text" class="loading-text">
        {{ text }}
      </div>
      
      <div v-if="showProgress" class="loading-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${progress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ progress }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  text?: string
  overlay?: boolean
  showProgress?: boolean
  progress?: number
  size?: 'small' | 'medium' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  overlay: false,
  showProgress: false,
  progress: 0,
  size: 'medium'
})
</script>

<style scoped>
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.loading--overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(4px);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.loading-spinner {
  position: relative;
  width: 40px;
  height: 40px;
}

.spinner-ring {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 3px solid transparent;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-ring:nth-child(2) {
  animation-delay: 0.1s;
  border-top-color: #0056b3;
}

.spinner-ring:nth-child(3) {
  animation-delay: 0.2s;
  border-top-color: #004085;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 14px;
  color: #666;
  text-align: center;
}

.loading-progress {
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-bar {
  width: 100%;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #666;
  text-align: center;
}

/* 尺寸变体 */
.loading--small .loading-spinner {
  width: 24px;
  height: 24px;
}

.loading--small .spinner-ring {
  border-width: 2px;
}

.loading--small .loading-text {
  font-size: 12px;
}

.loading--large .loading-spinner {
  width: 60px;
  height: 60px;
}

.loading--large .spinner-ring {
  border-width: 4px;
}

.loading--large .loading-text {
  font-size: 16px;
}

.loading--large .loading-progress {
  width: 300px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .loading-progress {
    width: 150px;
  }
  
  .loading--large .loading-progress {
    width: 200px;
  }
}
</style>
