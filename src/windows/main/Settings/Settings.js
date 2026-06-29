class Settings {
    constructor() {
        this._categories = []
    }
    registerCategory({id,label,icon}) {
        this._categories.push({id,label,icon})
    }
    register({categoryId,label,settings}) {}
}