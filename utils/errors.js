class IntegrityError extends Error {
    constructor(message, fieldname) {
        super(message)
        this.name = this.constructor.name
        this.fieldname = fieldname
    }

    get error() {
        return this.errorObject()
    }
    errorObject() {
        return { [this.fieldname]: this.message };
    }

}

module.exports = { IntegrityError }
