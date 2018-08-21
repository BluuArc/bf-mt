export function delay(time = 0) {
  return new Promise(fulfill => {
    setTimeout(fulfill, time);
  });
}
