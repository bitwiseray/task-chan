const { QuickDB } = require("quick.db");
const ShiftDb = new QuickDB();
const { UserError, NotFoundError, PermissionError, InternalError } =  require('./HandleError');

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
        broadcastMessageId: data.broadcastMessageId ?? null,
        deadline: data.deadline ?? null,
        status: data.status ?? "PENDING",
        createdAt: Date.now(),
        startedAt: null
      };

      await this.db.set(key, shift);
      return { success: true, cause: null };
    } catch (error) {
      throw new InternalError(error);
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
      throw new InternalError(error);
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
      throw new InternalError(error);
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
      throw new InternalError(error);
    }
  }

  async getShiftByUser(userId) {
    try {
      const allShifts = await this.db.all();
      const shiftEntry = allShifts.find(
        (item) => item.value.assignedId === userId && item.value.status !== "PENDING"
      );
      if (!shiftEntry) throw new NotFoundError("Shift not found");
      return { id: shiftEntry.id, ...shiftEntry.value };
    } catch (error) {
      throw new InternalError(error);
    }
  }

  /**
   * Prompt a shift to start
   * @param {String} key 
   * @param {Object} user 
   */
  async start(key, user) {
    try {
      const shift = await this.get(key);
      if (!shift) throw new NotFoundError('Shift not found');
      if (shift.assignedId !== user.id) throw new PermissionError('You are not assigned to this shift');
      if (shift.status !== "STARTED") throw new UserError('Shift has not started yet');
      shift.status = "STARTED";
      shift.startedAt = Date.now();
      await this.db.set(key, shift);
    } catch (error) {
      throw new InternalError(error);
    }
  }

  /**
   * Reject a shift
   * @param {String} key 
   * @param {Object} user 
   */
  async reject(key, user) {
    try {
      const shift = await this.get(key);
      if (!shift) throw new NotFoundError("Shift not found");
      if (shift.status !== "PENDING") throw new UserError("Cannot reject a shift not assinged to anyone");
      if (shift.assignedId !== user.id) throw new PermissionError("You are not assigned to this shift");
      shift.status = "REJECTED";
      await this.db.set(key, shift);
      return { success: true, cause: null };
    } catch (error) {
      throw new InternalError(error);
    }
  }

  /**
   * Finish a shift
   * @param {String} key 
   * @param {Object} user 
   */
  async completed(key, user) {
    try {
      const shift = await this.get(key);
      if (!shift) throw new NotFoundError("Shift not found");
      if (shift.status !== "STARTED") throw new UserError("Shift has not started");
      if (shift.assignedId !== user.id) throw new PermissionError("You are not assigned to this shift");
      shift.status = "COMPLETED";
      await this.db.set(key, shift);
      return { success: true, cause: null };
    } catch (error) {
      return { success: false, cause: error, data: null };
    }
  }

  async abandon(key, user) {
    try {
      const shift = await this.get(key);
      if (!shift) throw new NotFoundError("Shift not found");
      if (shift.status !== "STARTED" || shift.status === "ABANDONED") throw new UserError('Shift has not started or already abandoned');
      if (shift.assignedId !== user.id) throw new PermissionError("You are not assigned to this shift");
      shift.status = "ABANDONED";
      await this.db.set(key, shift);
    } catch (error) {
      throw error
    }
  }

  async pause(user) {
    try {
      const shift = await this.getShiftByUser(user.id);
      if (!shift) throw new NotFoundError("Shift not found");
      if (shift.status !== "STARTED") throw new UserError('Shift can only be paused if it has started.');
      if (shift.assignedId !== user.id) throw new PermissionError("You are not assigned to this shift");
      shift.status = "PAUSED";
      await this.db.set(shift.id, shift);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new Shift();