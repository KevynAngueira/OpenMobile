export const isLeafDetailsValid = (length, leafNumber, leafWidths) => {
    const validLength = !!length && !isNaN(parseFloat(length));
    const validLeafNumber = !!leafNumber && !isNaN(parseInt(leafNumber)) && parseInt(leafNumber) >= 7 && parseInt(leafNumber) <= 21;
    const validWidths = leafWidths.every((w) => w !== '' && !isNaN(parseFloat(w)));
    return validLength && validLeafNumber && validWidths;
};
  