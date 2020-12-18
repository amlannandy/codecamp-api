const advancedResults = (model, populate) => async (req, res, next) => {
  // Copy Request Query
  const reqQuery = { ...req.query };

  // Fields to exculde when using select query
  const removedFields = ['select', 'sort', 'page', 'limit'];
  //Loop over removeFields and delete them from reqQuery
  removedFields.forEach(param => delete reqQuery[param]);

  // To add dollar sign to operators such than lte, gte etc
  let queryStr = JSON.stringify(reqQuery);
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Store unfiltered model query
  let query = model.find(JSON.parse(queryStr));

  // Select specific fields if requested
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  if (populate) {
    query = query.populate(populate);
  }

  const results = await query;

  // Pagination result
  const pagination = {};
  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination: pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
