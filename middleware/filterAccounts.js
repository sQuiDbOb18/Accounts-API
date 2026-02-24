const filterAccounts = (req, res, next) => {
  const queryObj = { ...req.query }
  const excludedFields = [
    `page`,
    `limit`,
    `sort`,      
    `select`,
    `search`,
    `minAge`,
    `maxAge`
  ]
  excludedFields.forEach((field) => delete queryObj[field])

  if (req.query.age) {
    queryObj.age = {}
    if (req.query.age.gte){
      queryObj.age.$gte = Number(req.query.age.gte)
    }
    if (req.query.age.lte){
      queryObj.age.$lte = Number(req.query.age.lte)
    }
  }

  if (req.query.minAge || req.query.maxAge){
    queryObj.age = queryObj.age || {}
    if (req.query.minAge){
      queryObj.age.$gte = Number(req.query.minAge)
    }
    if (req.query.maxAge){
      queryObj.age.$lte = Number(req.query.maxAge)
    }
  }

  if (queryObj.role) {
    queryObj.role = { $in: queryObj.role.split(`,`) }
  }

  [`firstName`, `lastName`, `email`, `username`].forEach((field) => {
    if (queryObj[field]){
      queryObj[field] = {
        $regex: queryObj[field],
        $options: "i"
      }
    }
  })

  let searchQuery = {}
  if (req.query.search){
    searchQuery.$or = [
      { firstName: { $regex: req.query.search, $options: "i" } },
      { lastName: { $regex: req.query.search, $options: "i" } },
      { email: { $regex: req.query.search, $options: "i" } }, 
      { username: { $regex: req.query.search, $options: "i" } }
    ]
  }

  const page = Number(req.query.page) || 1
  const limit = Number(req.query.limit) || 10
  const skip = (page - 1) * limit

  const sort = req.query.sort || `-createdAt`

  let selectFields = null
  if (req.query.select){
    selectFields = req.query.select.split(`,`).join(` `)
  }

  req.filter = queryObj
  req.searchQuery = searchQuery
  req.pagination = { skip, limit }
  req.sort = sort
  req.select = selectFields

  next()
}


module.exports = filterAccounts