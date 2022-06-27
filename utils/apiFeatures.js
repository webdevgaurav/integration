const jsforce = require('jsforce');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  selectModel() {
    let model = this.queryString.model;
    model = model.toLowerCase()[0].toUpperCase() + model.substring(1);
    this.query = this.query.sobject(model);
    return this;
  }

  find() {
    if (this.queryString.startDate && this.queryString.endDate) {
      this.query = this.query.find({ $and: [{ CreatedDate: { $gte: jsforce.SfDate.toDateTimeLiteral(this.queryString.startDate) } }, { CreatedDate: { $lte: jsforce.SfDate.toDateTimeLiteral(this.queryString.endDate) } }] });

    } else if (this.queryString.id) {
      this.query = this.query.find({ Id: { $eq: this.queryString.id } });

    } else if (this.queryString.email) {
      this.query = this.query.find({ Email: { $eq: this.queryString.email } });

    } else if (this.queryString.startDate) {
      this.query = this.query.find({ CreatedDate: { $gte: jsforce.SfDate.toDateTimeLiteral(this.queryString.startDate) } });

    } else if (this.queryString.endDate) {
      this.query = this.query.find({ CreatedDate: { $lte: jsforce.SfDate.toDateTimeLiteral(this.queryString.endDate) } });

    } else {
      this.query = this.query.find({});

    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      let sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-CreatedDate');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const offset = (page - 1) * limit;
    this.query = this.query.limit(limit).offset(offset);
    return this;
  }
}

module.exports = APIFeatures;
