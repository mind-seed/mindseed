export type SuccessResponseDto<T> = {
  success: true;
  data: T;
};

export type ErrorResponseDto<E> = {
  success: false;
  statusCode: number;
  errorCode?: E;
};
