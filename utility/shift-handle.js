const { QuickDB } = require("quick.db");
const ShiftDb = new QuickDB();

class Shift {
  constructor() {
    // Hii
  }

  async start(key, object) {
    try {
        const sfn = ShiftDb.set(key, object);
        console.log('Shift set', sfn);
    } catch (error) {
        return { success: false, cause: error };
    }
    return { 'success': true, cause: null };
  }

  async end(key) {
    try {
      ShiftDb.delete(key);
    } catch (error) {
        return { success: false, cause: error };
    }
    return { 'success': true, cause: null }
  }

  listAll() {
    try {
        return ShiftDb.all()
    } catch (error) {
        return { success: false, cause: error, data: null };
    }
  }

}

module.exports = new Shift();