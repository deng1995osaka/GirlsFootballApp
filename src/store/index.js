export * from './newsStore';

// 统一的错误处理
export const handleError = (error) => {
  console.error('API Error:', error);
  throw error;
}; 