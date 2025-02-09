export const capitalizeFirstLetter = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const capitalizeFirstLetterAllWords = (str) => {
    let result = '';
    let capitalizeNext = true;
    
    for (let i = 0; i < str.length; i++) {
        const char = str[i];
        
        if (capitalizeNext && char !== ' ') {
            result += char.toUpperCase();
            capitalizeNext = false;
        } else {
            result += char;
        }
        
        // Reset flag for next word
        if (char === ' ') {
            capitalizeNext = true;
        }
    }
    
    return result;
};

export const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};