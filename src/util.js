/**
 * Inserts an item/items to an array at the given index
 * Meant for use via ES7 ::bind syntax
 * @param  {int}   index
 * @param  {mixed} ...items Items to insert
 */
export function insert(index, ...items) {
	this.splice.apply(this, [index, 0].concat(items));
	return this;
}
