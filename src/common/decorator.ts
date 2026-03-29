export const RESPONSE_MESSAGE_KEY = 'response_message';

export const ResponseMessage = (message: string): MethodDecorator => Reflect.metadata(RESPONSE_MESSAGE_KEY, message);
