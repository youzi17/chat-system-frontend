import { ref, nextTick, onMounted, onUnmounted, computed, watch } from 'vue'

// 滚动组合式函数
export function useScroll(containerRef?: () => HTMLElement | undefined | null) {
  const scrollContainer = ref<HTMLElement>()
  const isAtBottom = ref(true)
  const isScrolling = ref(false)
  const scrollTimeout = ref<ReturnType<typeof setTimeout> | undefined>()
  
  // 如果提供了容器引用，则监听其变化
  if (containerRef) {
    watch(
      () => containerRef(),
      (newContainer) => {
        if (newContainer) {
          scrollContainer.value = newContainer
          removeScrollListener()
          setupScrollListener()
          checkIfAtBottom()
        }
      },
      { immediate: true }
    )
  }

  // 滚动到底部
  const scrollToBottom = (smooth: boolean = true) => {
    if (!scrollContainer.value) return

    nextTick(() => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollTo({
          top: scrollContainer.value.scrollHeight,
          behavior: smooth ? 'smooth' : 'auto'
        })
      }
    })
  }

  // 滚动到顶部
  const scrollToTop = (smooth: boolean = true) => {
    if (!scrollContainer.value) return

    scrollContainer.value.scrollTo({
      top: 0,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  // 滚动到指定位置
  const scrollTo = (position: number, smooth: boolean = true) => {
    if (!scrollContainer.value) return

    scrollContainer.value.scrollTo({
      top: position,
      behavior: smooth ? 'smooth' : 'auto'
    })
  }

  // 检查是否在底部
  const checkIfAtBottom = () => {
    if (!scrollContainer.value) return

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
    const threshold = 10 // 10px的容差
    isAtBottom.value = scrollHeight - scrollTop - clientHeight <= threshold
  }

  // 处理滚动事件
  const handleScroll = () => {
    isScrolling.value = true
    checkIfAtBottom()

    // 清除之前的定时器
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }

    // 设置新的定时器
    scrollTimeout.value = setTimeout(() => {
      isScrolling.value = false
    }, 150)
  }

  // 自动滚动到底部（当新消息到达时）
  const autoScrollToBottom = () => {
    if (isAtBottom.value) {
      scrollToBottom(true)
    }
  }

  // 监听滚动事件
  const setupScrollListener = () => {
    if (scrollContainer.value) {
      scrollContainer.value.addEventListener('scroll', handleScroll, { passive: true })
    }
  }

  // 移除滚动事件监听
  const removeScrollListener = () => {
    if (scrollContainer.value) {
      scrollContainer.value.removeEventListener('scroll', handleScroll)
    }
    if (scrollTimeout.value) {
      clearTimeout(scrollTimeout.value)
    }
  }

  // 获取滚动位置信息
  const getScrollInfo = () => {
    if (!scrollContainer.value) return null

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer.value
    return {
      scrollTop,
      scrollHeight,
      clientHeight,
      isAtBottom: isAtBottom.value,
      scrollPercentage: scrollHeight > 0 ? (scrollTop / (scrollHeight - clientHeight)) * 100 : 0
    }
  }

  onMounted(() => {
    setupScrollListener()
  })

  onUnmounted(() => {
    removeScrollListener()
  })

  return {
    scrollContainer,
    isAtBottom: computed(() => isAtBottom.value),
    isScrolling: computed(() => isScrolling.value),
    scrollToBottom,
    scrollToTop,
    scrollTo,
    autoScrollToBottom,
    checkIfAtBottom,
    getScrollInfo
  }
}
