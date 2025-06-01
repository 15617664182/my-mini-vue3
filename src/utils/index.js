/**
 * 判断是否为对象 不可以用Object.prototype.toString.call(obj) 因为
 * */
export function isObject(obj){
    // return Object.prototype.toString.call(obj) === '[object Object]';
    return typeof obj === 'object' && obj !== null;

}
/**
 * 判断两值是否相等
 * */
export function hasChanged(value,oldValue){
    return value !== oldValue && (value === value || oldValue === oldValue);

}


/**
 *
 * */
export function isArray(val){
    return Array.isArray(val);
}

export function isFunc(val){
    return typeof val === 'function';
}

/**
 *
 * 传入一个参数  返回boolean
 * 两个参数  obj 存在时 返回 obj     obj不存在时否则返回defaultValue
 * */
export function isEmpty(obj, defaultValue) {
    if (obj === undefined || obj === null || obj === NaN || obj === 'NaN' || obj === 'setEmptyJly' || obj === 'undefined' || obj === 'null' ||
        obj ===
        '' || obj === '&nbsp;' || obj.length === 0 || obj === false) {
        if (defaultValue !== undefined && defaultValue !== null) {
            return defaultValue
        } else {
            return true
        }
    }
    if (defaultValue !== undefined && defaultValue !== null) {
        return obj
    } else {
        return false
    }
}

export function isString(val){
    return typeof val === 'string';
}
export function isNumber(val){
    return typeof val === 'number';
}
export function isBoolean(val){
    return typeof val === 'boolean';
}
