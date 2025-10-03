const { QuickDB } = require("quick.db");
const ShiftDb = new QuickDB();

class Shift {
  constructor() {
    this.db = ShiftDb;
  }

  /**
   * Start (create) a new shift
   * @param {String} key - Unique key/id for the shift
   * @param {Object} data - Shift details
   */
  async post(key, data) {
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
   * @param {String} key - Unique key/id for the shift
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
   * @param {String} key - Unique key/id for the shift
   */
  async get(key) {
    try {
      const shift = await this.db.get(key);
      return shift;
    } catch (error) {
      return { success: false, cause: error, data: null };
    }
  }

  /**
   * Prompt a shift to start
   * @param {String} key 
   * @param {Object} user 
   */
  async start(key, user) {
    try {
      const shift = await this.db.get(key);
      if (!shift) return { success: false, cause: "Shift not found", data: null };
      if (shift.status !== "PENDING") return { success: false, cause: "Shift is not pending", data: null };
      if (shift.assignedId !== user.id) return { success: false, cause: "You are not assigned to this shift", data: null };
      shift.status = "STARTED";
      shift.startedAt = Date.now();
      await this.db.set(key, shift);
      return { success: true, cause: null };
    } catch (error) {
      return { success: false, cause: error, data: null };
    }
  }

  /**
   * Reject a shift
   * @param {String} key 
   * @param {Object} user 
   */
  async reject(key, user) {
    try {
      const shift = await this.db.get(key);
      if (!shift) return { success: false, cause: "Shift not found", data: null };
      if (shift.status !== "PENDING") return { success: false, cause: "Cannot reject an active shift", data: null };
      if (shift.assignedId !== user.id) return { success: false, cause: "You are not assigned to this shift", data: null };
      shift.status = "REJECTED";
      await this.db.set(key, shift);
      return { success: true, cause: null };
    } catch (error) {
      return { success: false, cause: error, data: null };
    }
  }

  /**
   * Finish a shift
   * @param {String} key 
   * @param {Object} user 
   */
  async completed(key, user) {
    try {
      const shift = await this.db.get(key);
      if (!shift) return { success: false, cause: "Shift not found", data: null };
      if (shift.status !== "STARTED") return { success: false, cause: "Shift is not started", data: null };
      if (shift.assignedId !== user.id) return { success: false, cause: "You are not assigned to this shift", data: null };
      shift.status = "COMPLETED";
      await this.db.set(key, shift);
      return { success: true, cause: null };
    } catch (error) {
      return { success: false, cause: error, data: null };
    }
  }
}

module.exports = new Shift();