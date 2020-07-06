module.exports = {
  ifCond: (a, b, options) => {
    if (a === b)
      return options.fn(this)
    else {
      return options.inverse(this)
    }
  }
}