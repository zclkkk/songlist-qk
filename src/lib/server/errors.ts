export const getErrorMessage = (error: unknown) => (error instanceof Error ? error.message : '未知错误。');
