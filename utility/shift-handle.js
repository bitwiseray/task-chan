const { QuickDB } = require("quick.db");
const ShiftDb = new QuickDB();

class Shift {
  constructor() {
    this.db = ShiftDb;
  }

  /**
   * Start (create) a new shift
   * @param {string} key - Unique key/id for the shift
   * @param {object} data - Shift details
   */
  async start(key, data) {
    try {
      const shift = {
        title: data.title ?? "Untitled Shift",
        details: data.details ?? null,
        assignedId: data.assignedId ?? null,
        deadline: data.deadline ?? null,
        status: data.status ?? "PENDING",
        createdAt: Date.now(),
        startedAt: null
      };
  
      await this.db.set(key, shift);
      return { success: true, cause: null };
    } catch (error) {
      return { success: false, cause: error, data: null };
    }
  }

  /**
   * Delete a shift
   */
  async delete(key) {
    try {
      await this.db.delete(key);
      return { success: true, cause: null };
    } catch (error) {
      return { success: false, cause: error };
    }
  }

  /**
   * List all shifts
   */
  async listAll() {
    try {
      const list = await this.db.all();
      const clean = list.map(item => ({
        id: item.id,
        ...item.value
      }));
      return clean;
    } catch (error) {
      return { success: false, cause: error, data: [] };
    }
  }

  /**
   * Get one shift
   */
  async get(key) {
    try {
      const shift = await this.db.get(key);
      return shift;
    } catch (error) {
      return { success: false, cause: error, data: null };
    }
  }
}

module.exports = new Shift();
