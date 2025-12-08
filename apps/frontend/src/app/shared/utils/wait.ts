export async function wait(time = 1200): Promise<void> {
  await new Promise(resolve => {
    setTimeout(() => {
      resolve(null);
    }, time);
  });
}
