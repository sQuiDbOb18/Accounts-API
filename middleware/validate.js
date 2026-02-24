const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body)
    if (!result.success){
      const errors = result.error.issues.map(err => ({
        field: err.path[0],
        message: err.message
      }))
      
      return res.status(400).json(({
        success: false,
        type: "VALIDATION_ERROR", 
        errors
      }))
    }
    req.body = result.data
    next()
  }
}

module.exports = validate