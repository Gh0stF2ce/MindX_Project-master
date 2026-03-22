import { debounce } from "lodash";

export function mindxDebounce(func) {
  return debounce(func, 3000, { leading: true, maxWait: 3500, trailing: false })
}