/**
 * @link https://github.com/redux-utilities/flux-standard-action
 */
export interface Action {
  /**
   * The `type` of an action identifies to the consumer the nature of the action that has occurred. `type` is a string constant. If two types are the same, they MUST be strictly equivalent (using `===`).
   */
  type: string;
  /**
   * The optional `payload` property MAY be any type of value. It represents the payload of the action. Any information about the action that is not the `type` or status of the action should be part of the `payload` field.
   * By convention, if `error` is `true`, the `payload` SHOULD be an error object. This is akin to rejecting a promise with an error object
   */
  payload?: object | typeof Error;
  /**
   * The optional `error` property MAY be set to `true` if the action represents an error.
   * An action whose `error` is true is analogous to a rejected Promise. By convention, the `payload` SHOULD be an error object.
   * If `error` has any other value besides `true`, including `undefined` and `null`, the action MUST NOT be interpreted as an error.
   */
  error?: boolean;
  /**
   * The optional `meta` property MAY be any type of value. It is intended for any extra information that is not part of the payload.
   */
  meta?: object;
}
