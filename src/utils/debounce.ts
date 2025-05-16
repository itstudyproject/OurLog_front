/**
 * 함수 호출을 지연시키는 debounce 함수
 * 동일한 함수가 짧은 시간 내에 여러 번 호출될 때, 마지막 호출만 실행되도록 합니다.
 * 
 * @param func 실행할 함수
 * @param delay 지연 시간 (ms)
 */
export const debounce = <T extends (...args: any[]) => void>(
  func: T,
  delay = 500
): ((...args: Parameters<T>) => void) => {
  let timeoutId: ReturnType<typeof setTimeout>;

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}; 