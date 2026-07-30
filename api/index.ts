const importApp = async () => {
  try {
    const built = await import('../dist/server.cjs');
    return built.default ?? built;
  } catch (error) {
    return (await import('../server.ts')).default;
  }
};

const app = await importApp();
export default app;

