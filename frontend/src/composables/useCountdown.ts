import { ref, computed, watch, onUnmounted, toValue, type MaybeRefOrGetter } from "vue";

export const useCountdown = (expiresAt: MaybeRefOrGetter<string | null>) => {
  const seconds = ref(0);
  let timer: ReturnType<typeof setInterval> | null = null;

  const calcRemaining = () => {
    const value = toValue(expiresAt);
    if (!value) return 0;
    const diff = new Date(value).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / 1000));
  };

  const formatted = computed(() => {
    const m = Math.floor(seconds.value / 60);
    const s = seconds.value % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  });

  const isExpired = computed(() => seconds.value <= 0);

  const stop = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const tick = () => {
    seconds.value = calcRemaining();
    if (seconds.value <= 0) stop();
  };

  const start = () => {
    stop();
    tick();
    if (seconds.value > 0) {
      timer = setInterval(tick, 1000);
    }
  };

  watch(() => toValue(expiresAt), () => {
    start();
  }, { immediate: true });

  onUnmounted(() => {
    stop();
  });

  return { seconds, formatted, isExpired };
};
