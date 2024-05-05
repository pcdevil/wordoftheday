/**
 * Named Error class
 *
 * By default the `Error` class doesn't reflect the extended class name, therefore thrown error are shown as "Uncaught Error", instead of their respective name.
 * This extended class with setting the name to the constructor's name changes the behaviour and allow to see the name at the top level.
 */
export class NamedError extends Error {
	name = this.constructor.name;
}
