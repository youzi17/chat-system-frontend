<template>
  <button
    :class="buttonClasses"
    :disabled="disabled || loading"
    @click="handleClick"
  >
    <AppIcon v-if="loading" name="more-horizontal" spin class="button-icon" />
    <AppIcon v-else-if="icon" :name="icon" class="button-icon" />
    
    <span v-if="$slots.default" class="button-content">
      <slot />
    </span>
    
    <div v-if="loading" class="button-loading">
      <div class="loading-dots">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import { AppIcon } from '../Icon'

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  type?: 'button' | 'submit' | 'reset'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false,
  fullWidth: false,
  type: 'button'
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const slots = useSlots()

const buttonClasses = computed(() => {
  return [
    'button',
    `button--${props.variant}`,
    `button--${props.size}`,
    {
      'button--disabled': props.disabled,
      'button--loading': props.loading,
      'button--full-width': props.fullWidth,
      'button--icon-only': !slots.default && props.icon
    }
  ]
})

const handleClick = (event: MouseEvent) => {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 6px;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
}

/* 尺寸变体 */
.button--small {
  padding: 6px 12px;
  font-size: 12px;
  min-height: 28px;
}

.button--medium {
  padding: 8px 16px;
  font-size: 14px;
  min-height: 36px;
}

.button--large {
  padding: 12px 24px;
  font-size: 16px;
  min-height: 44px;
}

/* 颜色变体 */
.button--primary {
  background: #007bff;
  color: white;
}

.button--primary:hover:not(.button--disabled) {
  background: #0056b3;
}

.button--secondary {
  background: #6c757d;
  color: white;
}

.button--secondary:hover:not(.button--disabled) {
  background: #545b62;
}

.button--outline {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.button--outline:hover:not(.button--disabled) {
  background: #007bff;
  color: white;
}

.button--ghost {
  background: transparent;
  color: #007bff;
}

.button--ghost:hover:not(.button--disabled) {
  background: rgba(0, 123, 255, 0.1);
}

.button--danger {
  background: #dc3545;
  color: white;
}

.button--danger:hover:not(.button--disabled) {
  background: #c82333;
}

/* 状态变体 */
.button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.button--loading {
  cursor: not-allowed;
}

.button--full-width {
  width: 100%;
}

.button--icon-only {
  padding: 8px;
  min-width: 36px;
}

.button--icon-only.button--small {
  padding: 6px;
  min-width: 28px;
}

.button--icon-only.button--large {
  padding: 12px;
  min-width: 44px;
}

/* 图标样式 */
.button-icon {
  flex-shrink: 0;
}

.button-content {
  flex: 1;
  min-width: 0;
}

/* 加载状态 */
.button-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.loading-dots {
  display: flex;
  gap: 2px;
}

.loading-dots span {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: currentColor;
  animation: loadingDots 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes loadingDots {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .button--medium {
    padding: 10px 16px;
    font-size: 14px;
  }
  
  .button--large {
    padding: 12px 20px;
    font-size: 15px;
  }
}
</style>
